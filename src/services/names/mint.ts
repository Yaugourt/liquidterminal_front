"use client";

import { erc20Abi, formatUnits, parseAbi, zeroAddress, zeroHash, type Address, type EIP1193Provider, type Hash, type Hex } from "viem";
import { namehash, normalize } from "viem/ens";
import { get, post, postExternal } from "@/services/api/axios-config";
import { buildHyperliquidUrl } from "@/services/api/constants";
import { hyperEvmClient, hyperEvmWallet } from "@/lib/hyperevm/wallet";

/**
 * Minting .hl names on Liquid Terminal, through the Hyperliquid Names Builder
 * Program (github.com/HLnames/hln_api_minting):
 *   1. our backend asks their API for a signed mint pass (valid ~60s),
 *   2. the user's wallet calls their Minter contract with it, in HYPE or USDC.
 *
 * A mint can carry a referral (the namehash of a registered .hl name): the
 * buyer pays less and the referrer earns a share. Measured on the Minter on
 * 27 Oct 2026: with liquidterminal.hl it takes exactly 80% of the price
 * (USDC binary-searched to the unit, HYPE to 0.01%), with any other .hl name
 * 90%; an unregistered referral reverts, so ours is only passed once it is
 * registered. Every extra year adds RENEWAL_USD to the price (their
 * Builder Program docs), and the Minter computes it from durationInYears.
 */

export const HLN_MINTER: Address = "0xb1d8b142c6B8C1738D0F522164D618218d53aB00";
export const HLN_NAMES: Address = "0x1d9d87eBc14e71490bB87f1C39F65BDB979f3cb7";
export const HYPEREVM_USDC: Address = "0xb88339CB7199b77E23DB6E890353E22632Ba630f";

/** The .hl name our mints are referred by. */
export const HLN_REFERRAL_NAME = process.env.NEXT_PUBLIC_HLN_REFERRAL || "liquidterminal.hl";

/** Mint price by label length (Hyperliquid Names docs, "Mint a name"), USD for one year. */
export function priceUsd(label: string): number {
  const n = [...label].length;
  return n === 1 ? 69 : n === 2 ? 42 : n === 3 ? 33 : 20;
}
export const PRICE_TIERS = [
  { length: "1 character", usd: 69 },
  { length: "2 characters", usd: 42 },
  { length: "3 characters", usd: 33 },
  { length: "4+ characters", usd: 20 },
] as const;
export const RENEWAL_USD = 10;
/** Our referral's discount on chain (see above). */
export const REFERRAL_DISCOUNT = 0.2;
export const MAX_YEARS = 5;

/** List price in USD for `years` years: the mint, then RENEWAL_USD per extra year. */
export function totalUsd(label: string, years: number): number {
  return priceUsd(label) + RENEWAL_USD * (years - 1);
}

const minterAbi = parseAbi([
  "function mintWithNative(string label, uint256 durationInYears, bytes sig, uint256 timestamp, bytes32 referral) payable",
  "function mintWithERC20(string label, uint256 durationInYears, bytes sig, uint256 timestamp, address token, bytes32 referral)",
]);
const namesAbi = parseAbi(["function ownerOf(uint256 tokenId) view returns (address)"]);

export type LabelCheck =
  | { ok: true; label: string; name: string }
  | { ok: false; reason: string };

/** "Foo.hl", " foo " → "foo" (ENS normalization, as their Minter expects), or why it can't be minted. */
export function checkLabel(input: string): LabelCheck {
  const raw = input.trim().replace(/\.hl$/i, "");
  if (!raw) return { ok: false, reason: "Type the name you want." };
  if (raw.includes(".")) return { ok: false, reason: "One label only: dots are not allowed." };
  let label: string;
  try {
    label = normalize(raw);
  } catch {
    return { ok: false, reason: "This name has characters that are not allowed." };
  }
  const length = [...label].length;
  if (length < 1 || length > 30) return { ok: false, reason: "Between 1 and 30 characters." };
  return { ok: true, label, name: `${label}.hl` };
}

/** Current owner of a .hl name, null when nobody holds it. Read on chain, never cached. */
export async function nameOwner(name: string): Promise<Address | null> {
  try {
    const owner = await hyperEvmClient.readContract({ address: HLN_NAMES, abi: namesAbi, functionName: "ownerOf", args: [BigInt(namehash(name))] });
    return owner === zeroAddress ? null : owner;
  } catch {
    // ownerOf reverts for names that were never minted.
    return null;
  }
}

let referralCache: Promise<Hex> | null = null;

/** Namehash of our referral name if it is registered, else no referral. */
export function referralHash(): Promise<Hex> {
  referralCache ??= nameOwner(HLN_REFERRAL_NAME)
    .then((owner) => (owner ? namehash(HLN_REFERRAL_NAME) : zeroHash))
    .catch(() => {
      referralCache = null;
      return zeroHash;
    });
  return referralCache;
}

export type PayToken = "native" | "usdc";

interface MintPass {
  label: string;
  sig: Hex;
  timestamp: number;
  token: string;
  amountRequired: string;
}

/**
 * Most a pass may ask for, above the price we expect from the public price
 * list: USDC passes are exact; HYPE passes follow their oracle, which drifts
 * from the Hyperliquid mid we price against by far less than this.
 */
const USDC_TOLERANCE_BPS = 0n;
const HYPE_TOLERANCE_BPS = 1_000n; // 10%

/** HYPE in USD (Hyperliquid mid), to check what a HYPE mint pass asks for. */
export async function hypeUsd(): Promise<number | null> {
  try {
    const mids = await postExternal<Record<string, string>>(buildHyperliquidUrl("HYPERLIQUID_INFO"), { type: "allMids" });
    const px = Number(mids?.HYPE);
    return Number.isFinite(px) && px > 0 ? px : null;
  } catch {
    return null;
  }
}

/** HYPE wei for `usd` at `px`, rounded up. */
const hypeWei = (usd: number, px: number) => (BigInt(Math.round(usd * 1e6)) * 10n ** 18n + BigInt(Math.round(px * 1e6)) - 1n) / BigInt(Math.round(px * 1e6));

/**
 * Asks our backend for a signed pass and checks it before any wallet sees it:
 * it must be for this label and token, and must not cost more than the public
 * price. The backend checks the same; this repeats it so a compromised or
 * misconfigured backend still cannot make the page ask for more.
 */
async function mintPass(label: string, token: PayToken): Promise<MintPass> {
  const res = await post<{ success: boolean; data: MintPass }>(`/names/mintpass/${encodeURIComponent(label)}`, { token }, { useCache: false });
  const pass = res.data;
  const fail = (why: string) => new Error(`Mint stopped: ${why}. Nothing was sent. Try again in a minute.`);
  if (!res.success || !pass?.sig) throw new Error("Hyperliquid Names did not sign the mint. Try again in a minute.");
  if (pass.label !== label) throw fail("the signed name does not match the one you typed");
  const expectedToken = token === "usdc" ? HYPEREVM_USDC.toLowerCase() : "native";
  if (typeof pass.token !== "string" || pass.token.toLowerCase() !== expectedToken) throw fail("the payment token does not match");
  if (!/^[1-9][0-9]{0,29}$/.test(pass.amountRequired)) throw fail("the quoted amount is not valid");

  const amount = BigInt(pass.amountRequired);
  const usd = priceUsd(label);
  if (token === "usdc") {
    const max = (BigInt(usd) * 1_000_000n * (10_000n + USDC_TOLERANCE_BPS)) / 10_000n;
    if (amount > max) throw fail(`the quote is above the $${usd} list price`);
  } else {
    const px = await hypeUsd();
    if (px == null) throw fail("the HYPE price could not be read to check the quote");
    const max = (hypeWei(usd, px) * (10_000n + HYPE_TOLERANCE_BPS)) / 10_000n;
    if (amount > max) throw fail(`the quote is above the $${usd} list price at today's HYPE price`);
  }
  return pass;
}

/**
 * The wallet must still be on the account and the network the user saw:
 * a wallet that switched either in between is stopped before it signs.
 */
async function assertWalletState(provider: EIP1193Provider, account: Address): Promise<void> {
  const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
  if (!accounts.some((a) => a.toLowerCase() === account.toLowerCase())) {
    throw new Error("Your wallet switched account. Reconnect and try again.");
  }
  const chainId = Number(BigInt((await provider.request({ method: "eth_chainId" })) as string));
  if (chainId !== 999) throw new Error("Your wallet is not on HyperEVM. Switch network and try again.");
}

export type MintStep = "pass" | "approve" | "confirm" | "pending";

/**
 * Mints `label`.hl for one year to `account`. Simulates first so a taken
 * name, a missing balance or an expired pass fails before the wallet opens.
 * HYPE is sent with a 2% margin over the oracle quote (their example does the
 * same; the Minter keeps only the price). USDC is exact, after an approval
 * if the allowance is short.
 */
export async function mintName(opts: {
  provider: EIP1193Provider;
  account: Address;
  label: string;
  token: PayToken;
  years?: number;
  onStep?: (step: MintStep) => void;
}): Promise<Hash> {
  const { provider, account, label, token, onStep } = opts;
  const years = Math.min(Math.max(Math.trunc(opts.years ?? 1), 1), MAX_YEARS);
  const wallet = hyperEvmWallet(provider, account);
  const referral = await referralHash();
  // The pass prices one year at the list price: scale it to the years and
  // the referral discount, as the Minter does (basis points, exact in USDC).
  const shareBps = referral === zeroHash ? 10_000n : BigInt(Math.round((1 - REFERRAL_DISCOUNT) * 10_000));
  const scale = (oneYear: bigint) => (oneYear * BigInt(totalUsd(label, years)) * shareBps) / (BigInt(priceUsd(label)) * 10_000n);

  if (token === "usdc") {
    onStep?.("pass");
    const first = await mintPass(label, "usdc");
    const amount = scale(BigInt(first.amountRequired));
    const allowance = await hyperEvmClient.readContract({ address: HYPEREVM_USDC, abi: erc20Abi, functionName: "allowance", args: [account, HLN_MINTER] });
    if (allowance < amount) {
      onStep?.("approve");
      await assertWalletState(provider, account);
      const approve = await wallet.writeContract({ address: HYPEREVM_USDC, abi: erc20Abi, functionName: "approve", args: [HLN_MINTER, amount] });
      await hyperEvmClient.waitForTransactionReceipt({ hash: approve });
    }
    // The approval can take longer than the pass lives: sign a fresh one.
    const pass = await mintPass(label, "usdc");
    const { request } = await hyperEvmClient.simulateContract({
      account,
      address: HLN_MINTER,
      abi: minterAbi,
      functionName: "mintWithERC20",
      args: [pass.label, BigInt(years), pass.sig, BigInt(pass.timestamp), HYPEREVM_USDC, referral],
    });
    onStep?.("confirm");
    await assertWalletState(provider, account);
    const hash = await wallet.writeContract(request);
    onStep?.("pending");
    await hyperEvmClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  onStep?.("pass");
  const pass = await mintPass(label, "native");
  // 2% over the oracle quote for price moves, as their example does.
  const value = (scale(BigInt(pass.amountRequired)) * 102n) / 100n;
  const { request } = await hyperEvmClient.simulateContract({
    account,
    address: HLN_MINTER,
    abi: minterAbi,
    functionName: "mintWithNative",
    args: [pass.label, BigInt(years), pass.sig, BigInt(pass.timestamp), referral],
    value,
  });
  onStep?.("confirm");
  await assertWalletState(provider, account);
  const hash = await wallet.writeContract(request);
  onStep?.("pending");
  await hyperEvmClient.waitForTransactionReceipt({ hash });
  return hash;
}

/** Asks the backend to drop its cached name for this address, so the new name shows up. */
export const forgetCachedName = (address: string) =>
  post(`/names/forget/${address}`, {}, { useCache: false }).catch(() => undefined);

/** HYPE and USDC a wallet holds on HyperEVM, as decimal numbers. */
export async function walletBalances(account: Address): Promise<{ hype: number; usdc: number }> {
  const [hype, usdc] = await Promise.all([
    hyperEvmClient.getBalance({ address: account }),
    hyperEvmClient.readContract({ address: HYPEREVM_USDC, abi: erc20Abi, functionName: "balanceOf", args: [account] }),
  ]);
  return { hype: Number(formatUnits(hype, 18)), usdc: Number(formatUnits(usdc, 6)) };
}

export interface OwnedName {
  name: string;
  /** Unix seconds, null when unknown. */
  expiry: number | null;
}

/** Names a wallet holds, soonest expiry first (backend, cached 5 min). */
export async function fetchOwnedNames(address: string): Promise<OwnedName[]> {
  const res = await get<{ success: boolean; data: OwnedName[] }>(`/names/owned/${address}`, undefined, { useCache: false });
  return res.data ?? [];
}

let cardTemplate: Promise<string | null> | null = null;

/** The Hyperliquid Names NFT card SVG (checked by the backend), to preview a name. */
export function fetchCardTemplate(): Promise<string | null> {
  cardTemplate ??= get<{ success: boolean; data: { svg: string } }>("/names/card-template")
    .then((r) => (r.data?.svg?.includes('id="dt"') ? r.data.svg : null))
    .catch(() => {
      cardTemplate = null;
      return null;
    });
  return cardTemplate;
}

const escapeXml = (s: string) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * The card with `name` in place of the template's: same sizing rule as their
 * own card script, font-size = min(795 / length, 50) px. Returned as a data
 * URI for an <img>, where nothing in the SVG can run.
 */
export function cardFor(template: string, name: string): string {
  const size = Math.min(795 / Math.max([...name].length, 1), 50);
  const svg = template.replace(
    /<text([^>]*)id="dt"([^>]*)>[^<]*<\/text>/,
    (_m, a: string, b: string) => `<text${a.replace(/font-size="[^"]*"/, "")}id="dt"${b.replace(/font-size="[^"]*"/, "")} font-size="${size.toFixed(2)}px">${escapeXml(name)}</text>`
  );
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
