"use client";

import { erc20Abi, parseAbi, zeroAddress, zeroHash, type Address, type EIP1193Provider, type Hash, type Hex } from "viem";
import { namehash, normalize } from "viem/ens";
import { post } from "@/services/api/axios-config";
import { hyperEvmClient, hyperEvmWallet } from "@/lib/hyperevm/wallet";

/**
 * Minting .hl names on Liquid Terminal, through the Hyperliquid Names Builder
 * Program (github.com/HLnames/hln_api_minting):
 *   1. our backend asks their API for a signed mint pass (valid ~60s),
 *   2. the user's wallet calls their Minter contract with it, in HYPE or USDC.
 *
 * A mint can carry a referral (the namehash of a registered .hl name): the
 * buyer pays 10% less and the referrer earns a share. Checked on 3 Oct 2026
 * by simulating the Minter: with a registered referral, 91% of the quoted
 * price goes through and 90% reverts; an unregistered referral reverts, so
 * we only pass ours once it is registered.
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
export const REFERRAL_DISCOUNT = 0.1;

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

async function mintPass(label: string, token: PayToken): Promise<MintPass> {
  const res = await post<{ success: boolean; data: MintPass }>(`/names/mintpass/${encodeURIComponent(label)}`, { token }, { useCache: false });
  if (!res.success || !res.data?.sig) throw new Error("Hyperliquid Names did not sign the mint. Try again in a minute.");
  return res.data;
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
  onStep?: (step: MintStep) => void;
}): Promise<Hash> {
  const { provider, account, label, token, onStep } = opts;
  const wallet = hyperEvmWallet(provider, account);
  const referral = await referralHash();
  const share = referral === zeroHash ? 100n : 92n; // the referral discount, with headroom

  if (token === "usdc") {
    onStep?.("pass");
    const first = await mintPass(label, "usdc");
    const amount = BigInt(first.amountRequired);
    const allowance = await hyperEvmClient.readContract({ address: HYPEREVM_USDC, abi: erc20Abi, functionName: "allowance", args: [account, HLN_MINTER] });
    if (allowance < amount) {
      onStep?.("approve");
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
      args: [pass.label, 1n, pass.sig, BigInt(pass.timestamp), HYPEREVM_USDC, referral],
    });
    onStep?.("confirm");
    const hash = await wallet.writeContract(request);
    onStep?.("pending");
    await hyperEvmClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  onStep?.("pass");
  const pass = await mintPass(label, "native");
  const value = (BigInt(pass.amountRequired) * share * 102n) / 10_000n;
  const { request } = await hyperEvmClient.simulateContract({
    account,
    address: HLN_MINTER,
    abi: minterAbi,
    functionName: "mintWithNative",
    args: [pass.label, 1n, pass.sig, BigInt(pass.timestamp), referral],
    value,
  });
  onStep?.("confirm");
  const hash = await wallet.writeContract(request);
  onStep?.("pending");
  await hyperEvmClient.waitForTransactionReceipt({ hash });
  return hash;
}

/** Asks the backend to drop its cached name for this address, so the new name shows up. */
export const forgetCachedName = (address: string) =>
  post(`/names/forget/${address}`, {}, { useCache: false }).catch(() => undefined);
