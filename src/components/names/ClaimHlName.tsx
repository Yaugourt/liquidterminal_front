"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAddress, zeroHash, type Address, type EIP1193Provider, type Hash } from "viem";
import { AlertTriangle, AtSign, Check, ChevronDown, ExternalLink, Minus, Plus, ShieldCheck, Wallet, X } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TokenAvatar } from "@/components/common";
import { useHlName } from "@/services/names";
import {
  cardFor,
  checkLabel,
  fetchCardTemplate,
  fetchOwnedNames,
  forgetCachedName,
  HLN_MINTER,
  HLN_NAMES,
  HYPEREVM_USDC,
  hypeUsd,
  MAX_YEARS,
  mintName,
  nameOwner,
  priceUsd,
  REFERRAL_DISCOUNT,
  referralHash,
  RENEWAL_USD,
  totalUsd,
  walletBalances,
  type MintStep,
  type OwnedName,
  type PayToken,
} from "@/services/names/mint";
import { connectWallet, injectedWallet, switchToHyperEvm, walletChainId, walletError } from "@/lib/hyperevm/wallet";
import { cn } from "@/lib/utils";

type Availability =
  | { state: "idle" }
  | { state: "invalid"; reason: string }
  | { state: "checking"; name: string }
  | { state: "free"; label: string; name: string }
  | { state: "taken"; name: string; owner: Address };

/** The mint, in the order the user goes through it. USDC adds the approval. */
const STEPS: { id: MintStep; label: string; usdcOnly?: boolean }[] = [
  { id: "pass", label: "Signed mint pass from Hyperliquid Names" },
  { id: "approve", label: "Approve the exact USDC amount", usdcOnly: true },
  { id: "confirm", label: "Confirm the mint in your wallet" },
  { id: "pending", label: "Minting on HyperEVM" },
];

const HLN_APP = "https://app.hlnames.xyz";
/** Links from their docs (hyperliquid-names.gitbook.io, read 2026-10-27). */
const HLN_LINKS = [
  { label: "Hypurr holder? A free mint or renewal per Hypurr each year", href: HLN_APP },
  { label: "Resolve .hl in Chrome", href: "https://chromewebstore.google.com/detail/hyperliquid-names/ganopiambbaiplpmnpccfhliamnhfmli" },
  { label: "Send to .hl in MetaMask", href: "https://snaps.metamask.io/snap/npm/hln-resolver-snap/" },
  { label: "Apps that read .hl", href: `${HLN_APP}/ecosystem` },
];

/** "$18", "$62.10": cents only when there are some. */
const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const tierLabel = (label: string) => {
  const n = [...label].length;
  return n >= 4 ? "4+ characters" : `${n} character${n > 1 ? "s" : ""}`;
};

function ContractLink({ address, label }: { address: string; label: string }) {
  return (
    <a href={`https://hyperevmscan.io/address/${address}`} target="_blank" rel="noopener noreferrer" className="mono text-text-secondary hover:text-brand">
      {label}
    </a>
  );
}

/** Debounced on-chain availability of what the user types. */
function useAvailability(input: string): Availability {
  const [state, setState] = useState<Availability>({ state: "idle" });
  useEffect(() => {
    if (!input.trim()) {
      setState({ state: "idle" });
      return;
    }
    const check = checkLabel(input);
    if (!check.ok) {
      setState({ state: "invalid", reason: check.reason });
      return;
    }
    setState({ state: "checking", name: check.name });
    let cancelled = false;
    const t = setTimeout(() => {
      nameOwner(check.name)
        .then((owner) => {
          if (cancelled) return;
          setState(owner ? { state: "taken", name: check.name, owner } : { state: "free", label: check.label, name: check.name });
        })
        .catch(() => !cancelled && setState({ state: "invalid", reason: "Could not reach HyperEVM. Try again." }));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [input]);
  return state;
}

/** The Hyperliquid Names NFT, drawn by their API, with the name being typed. */
function NameCard({ name, dimmed, template }: { name: string; dimmed: boolean; template: string | null }) {
  const src = useMemo(() => (template ? cardFor(template, name) : null), [template, name]);
  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[460px]">
      <div aria-hidden className="pointer-events-none absolute -inset-6 rounded-[32px] bg-brand/10 blur-3xl" />
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-2xl border border-brand/20 bg-base shadow-[0_20px_60px_-20px_rgba(131,233,255,0.35)] transition-opacity duration-300",
          dimmed && "opacity-60"
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- data: URI of the NFT SVG, checked by the backend
          <img src={src} alt={`${name} card preview`} className="h-full w-full" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="px-6 text-center text-[clamp(18px,5vw,30px)] font-semibold text-text-primary">{name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StepList({ token, step }: { token: PayToken; step: MintStep }) {
  const steps = STEPS.filter((s) => !s.usdcOnly || token === "usdc");
  const current = steps.findIndex((s) => s.id === step);
  return (
    <ol className="space-y-2.5" aria-live="polite">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2.5 text-[13px]">
          <span
            className={cn(
              "grid h-6 w-6 shrink-0 place-items-center rounded-full border mono text-[10.5px]",
              i < current && "border-success/40 bg-success/10 text-success",
              i === current && "border-brand/50 text-brand",
              i > current && "border-border-default text-text-tertiary"
            )}
          >
            {i < current ? <Check size={12} /> : i === current ? <InlineSpinner className="h-3 w-3" /> : i + 1}
          </span>
          <span className={i === current ? "text-text-primary" : i < current ? "text-text-secondary" : "text-text-tertiary"}>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

/** Days until a Unix-seconds expiry, as a short phrase. */
function expiresIn(expiry: number | null): { text: string; soon: boolean } {
  if (expiry == null) return { text: "expiry unknown", soon: false };
  const days = Math.floor((expiry * 1000 - Date.now()) / 86_400_000);
  if (days < 0) return { text: "expired", soon: true };
  return { text: days === 0 ? "expires today" : `expires in ${days} day${days > 1 ? "s" : ""}`, soon: days <= 30 };
}

/**
 * Search and mint a .hl name from Liquid Terminal (Hyperliquid Names Builder
 * Program). The card on the left is the NFT the user gets, drawn live with
 * the name they type. Availability is read on chain; the mint is signed in
 * the user's own wallet, in USDC or HYPE, for 1 to 5 years, with our referral.
 */
export function ClaimHlName({ initial = "" }: { initial?: string }) {
  const [input, setInput] = useState(initial);
  const [token, setToken] = useState<PayToken>("usdc");
  const [years, setYears] = useState(1);
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);
  const [account, setAccount] = useState<Address | null>(null);
  const [balances, setBalances] = useState<{ hype: number; usdc: number } | null>(null);
  const [owned, setOwned] = useState<OwnedName[] | null>(null);
  const [step, setStep] = useState<MintStep | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [minted, setMinted] = useState<{ name: string; hash: Hash; years: number } | null>(null);
  const [referred, setReferred] = useState(false);
  const [hypePx, setHypePx] = useState<number | null>(null);
  const [template, setTemplate] = useState<string | null>(null);

  const availability = useAvailability(input);
  const primaryName = useHlName(account);

  useEffect(() => {
    referralHash().then((h) => setReferred(h !== zeroHash));
    void hypeUsd().then(setHypePx);
    void fetchCardTemplate().then(setTemplate);
    const p = injectedWallet();
    setProvider(p);
    if (!p) return;
    const toAccount = (a: unknown) => {
      const first = (a as string[] | undefined)?.[0];
      setAccount(first ? getAddress(first) : null);
    };
    // A wallet already connected to the site shows up without a prompt.
    p.request({ method: "eth_accounts" }).then(toAccount).catch(() => undefined);
    p.on("accountsChanged", toAccount as never);
    return () => p.removeListener("accountsChanged", toAccount as never);
  }, []);

  // Balances and names of the connected wallet, read again after a mint.
  useEffect(() => {
    setBalances(null);
    setOwned(null);
    if (!account) return;
    let cancelled = false;
    walletBalances(account).then((b) => !cancelled && setBalances(b)).catch(() => undefined);
    fetchOwnedNames(account).then((n) => !cancelled && setOwned(n)).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [account, minted]);

  const discount = referred ? REFERRAL_DISCOUNT : 0;
  const discountPct = Math.round(REFERRAL_DISCOUNT * 100);
  const free = availability.state === "free" ? availability : null;

  const quote = useMemo(() => {
    if (!free) return null;
    const base = priceUsd(free.label);
    const list = totalUsd(free.label, years);
    const paid = list * (1 - discount);
    return { base, extra: list - base, saved: list - paid, paid, hype: hypePx ? paid / hypePx : null };
  }, [free, years, discount, hypePx]);

  const shortOfFunds = useMemo(() => {
    if (!quote || !balances) return false;
    return token === "usdc" ? balances.usdc < quote.paid : quote.hype != null && balances.hype < quote.hype * 1.02;
  }, [quote, balances, token]);

  const connect = async () => {
    if (!provider) return;
    setErr(null);
    try {
      setAccount(await connectWallet(provider));
    } catch (e) {
      setErr(walletError(e));
    }
  };

  const mint = async () => {
    if (!provider || !account || !free) return;
    setErr(null);
    try {
      if ((await walletChainId(provider)) !== 999) await switchToHyperEvm(provider);
      const hash = await mintName({ provider, account, label: free.label, token, years, onStep: setStep });
      setMinted({ name: free.name, hash, years });
      void forgetCachedName(account);
    } catch (e) {
      setErr(walletError(e));
    } finally {
      setStep(null);
    }
  };

  const busy = step !== null;
  const cardName = minted?.name ?? (availability.state === "idle" || availability.state === "invalid" ? "yourname.hl" : availability.name);
  const cardDimmed = !minted && (availability.state === "idle" || availability.state === "invalid" || availability.state === "taken");
  const fromPrice = totalUsd("name", years);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] xl:gap-10">
        {/* The NFT, live */}
        <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <NameCard name={cardName} dimmed={cardDimmed} template={template} />
          <div className="flex items-center justify-center gap-2 text-[12px] text-text-tertiary">
            <Image src="/partners/hlnames.svg" alt="" width={18} height={18} />
            <span>
              An NFT on HyperEVM, minted through the{" "}
              <a href={HLN_APP} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-brand">
                Hyperliquid Names
              </a>{" "}
              Builder Program
            </span>
          </div>
        </div>

        {/* Search and checkout */}
        <Card padding="none" className="min-w-0 overflow-hidden">
          <div className="space-y-5 p-5 md:p-6">
            {referred && !minted && (
              <div className="flex items-center gap-2.5 rounded-lg border border-gold/25 bg-gold/[0.07] px-3 py-2">
                <Image src="/partners/hlnames.svg" alt="" width={20} height={20} />
                <p className="text-[12.5px] text-text-secondary">
                  <span className="font-semibold text-gold">{discountPct}% off</span> every name minted on Liquid Terminal
                </p>
              </div>
            )}

            {minted ? (
              <div className="space-y-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
                  <Check size={20} />
                </span>
                <div>
                  <p className="text-[22px] font-semibold tracking-[-0.02em] text-text-primary">{minted.name} is yours</p>
                  <p className="mt-1 text-[13px] text-text-secondary">
                    Registered for {minted.years} year{minted.years > 1 ? "s" : ""}. Last step: make it your primary name, so apps show it instead of your address.
                  </p>
                </div>
                <Button asChild variant="ghostBrand" className="w-full">
                  <a href={`${HLN_APP}/profile`} target="_blank" rel="noopener noreferrer">
                    Set as primary name <ExternalLink />
                  </a>
                </Button>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
                  <a href={`https://hyperevmscan.io/tx/${minted.hash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-text-tertiary hover:text-brand">
                    Transaction <ExternalLink size={12} />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setMinted(null);
                      setInput("");
                    }}
                    className="text-text-tertiary hover:text-brand"
                  >
                    Mint another name
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="space-y-2">
                  <label htmlFor="hl-name" className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                    Find your name
                  </label>
                  <div
                    className={cn(
                      "flex items-center rounded-lg border bg-surface-2 px-4 transition-colors focus-within:border-brand/60",
                      availability.state === "taken" || availability.state === "invalid"
                        ? "border-danger/40"
                        : availability.state === "free"
                          ? "border-success/40"
                          : "border-border-default"
                    )}
                  >
                    <input
                      id="hl-name"
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setErr(null);
                      }}
                      placeholder="yourname"
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      autoFocus
                      disabled={busy}
                      className="h-14 min-w-0 flex-1 bg-transparent text-[22px] font-semibold tracking-[-0.01em] text-text-primary placeholder:text-text-tertiary/60 focus:outline-none"
                    />
                    <span className="mono text-[20px] text-text-tertiary">.hl</span>
                    {input && !busy && (
                      <button type="button" onClick={() => setInput("")} aria-label="Clear" className="focus-ring ml-3 rounded-md p-1 text-text-tertiary hover:text-text-primary">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div className="min-h-[20px] text-[13px]" aria-live="polite">
                    {availability.state === "idle" && <span className="text-text-tertiary">Letters, numbers, hyphens and emoji, 1 to 30 characters.</span>}
                    {availability.state === "invalid" && <span className="text-danger">{availability.reason}</span>}
                    {availability.state === "checking" && (
                      <span className="inline-flex items-center gap-1.5 text-text-tertiary">
                        <InlineSpinner className="h-3.5 w-3.5" /> Checking on HyperEVM…
                      </span>
                    )}
                    {availability.state === "taken" && (
                      <span className="text-text-secondary">
                        Taken, held by{" "}
                        <Link href={`/explorer/address/${availability.owner}`} className="mono text-brand hover:underline">
                          {short(availability.owner)}
                        </Link>
                        . Try another one.
                      </span>
                    )}
                    {availability.state === "free" && (
                      <span className="inline-flex items-center gap-1.5 font-medium text-success">
                        <Check size={14} /> Available
                      </span>
                    )}
                  </div>
                </div>

                {/* Payment token */}
                <div className="space-y-2">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">Pay with</p>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Payment token">
                    {(
                      [
                        { id: "usdc", label: "USDC", bal: balances ? `${balances.usdc.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC` : null },
                        { id: "native", label: "HYPE", bal: balances ? `${balances.hype.toLocaleString("en-US", { maximumFractionDigits: 3 })} HYPE` : null },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={token === t.id}
                        disabled={busy}
                        onClick={() => setToken(t.id)}
                        className={cn(
                          "focus-ring flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                          token === t.id ? "border-brand/50 bg-brand/[0.07]" : "border-border-default bg-surface-2/50 hover:border-border-strong"
                        )}
                      >
                        <TokenAvatar assetName={t.label} size="lg" />
                        <span className="min-w-0">
                          <span className={cn("block text-[14px] font-semibold", token === t.id ? "text-text-primary" : "text-text-secondary")}>{t.label}</span>
                          <span className="block truncate mono text-[11px] text-text-tertiary">{t.bal ?? "on HyperEVM"}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Years */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">Registration</p>
                    <p className="text-[12px] text-text-tertiary">+{usd(RENEWAL_USD)} per extra year</p>
                  </div>
                  <div className="flex items-center rounded-lg border border-border-default bg-surface-2/50">
                    <button
                      type="button"
                      aria-label="One year less"
                      disabled={busy || years <= 1}
                      onClick={() => setYears((y) => Math.max(1, y - 1))}
                      className="focus-ring grid h-9 w-9 place-items-center text-text-secondary hover:text-text-primary disabled:opacity-40"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="mono w-[76px] text-center text-[14px] font-semibold text-text-primary" aria-live="polite">
                      {years} year{years > 1 ? "s" : ""}
                    </span>
                    <button
                      type="button"
                      aria-label="One year more"
                      disabled={busy || years >= MAX_YEARS}
                      onClick={() => setYears((y) => Math.min(MAX_YEARS, y + 1))}
                      className="focus-ring grid h-9 w-9 place-items-center text-text-secondary hover:text-text-primary disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Receipt */}
                <div className="rounded-lg border border-border-subtle bg-base/50 px-4 py-3">
                  {quote && free ? (
                    <dl className="space-y-1.5 text-[13px]">
                      <div className="flex justify-between gap-3">
                        <dt className="min-w-0 truncate text-text-secondary">
                          {free.name} <span className="text-text-tertiary">· {tierLabel(free.label)}</span>
                        </dt>
                        <dd className="mono text-text-primary">{usd(quote.base)}</dd>
                      </div>
                      {quote.extra > 0 && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-text-secondary">
                            {years - 1} extra year{years > 2 ? "s" : ""}
                          </dt>
                          <dd className="mono text-text-primary">{usd(quote.extra)}</dd>
                        </div>
                      )}
                      {quote.saved > 0 && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-gold">Liquid Terminal referral −{discountPct}%</dt>
                          <dd className="mono text-gold">−{usd(quote.saved)}</dd>
                        </div>
                      )}
                      <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-border-subtle pt-2.5">
                        <dt className="font-medium text-text-primary">Total</dt>
                        <dd className="text-right">
                          <span className="mono text-[24px] font-semibold tracking-[-0.02em] text-text-primary">{usd(quote.paid)}</span>
                          {token === "native" && quote.hype != null && (
                            <span className="block mono text-[11.5px] text-text-tertiary">≈ {quote.hype.toFixed(4)} HYPE + 2% margin</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="text-text-tertiary">
                        From, {years} year{years > 1 ? "s" : ""}
                      </span>
                      <span className="flex items-baseline gap-2">
                        {discount > 0 && <span className="mono text-[12px] text-text-tertiary line-through">{usd(fromPrice)}</span>}
                        <span className="mono text-[18px] font-semibold text-text-primary">{usd(fromPrice * (1 - discount))}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Action */}
                {busy && step ? (
                  <StepList token={token} step={step} />
                ) : !provider ? (
                  <p className="rounded-lg border border-border-subtle bg-surface-2/50 px-3 py-2.5 text-[12.5px] text-text-secondary">
                    Open this page in a browser with a wallet extension (Rabby, MetaMask…) to mint.
                  </p>
                ) : !account ? (
                  <Button variant="ghostBrand" className="h-11 w-full" onClick={connect}>
                    <Wallet /> Connect wallet
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {shortOfFunds && (
                      <p className="flex items-start gap-2 text-[12.5px] text-warning">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        Not enough {token === "usdc" ? "USDC" : "HYPE"} on HyperEVM for this mint. Move some from Hyperliquid spot to HyperEVM, or pay with the other token.
                      </p>
                    )}
                    <Button variant="ghostBrand" className="h-11 w-full" onClick={mint} disabled={!free || shortOfFunds}>
                      <AtSign /> {free ? `Mint ${free.name}` : "Find an available name"}
                    </Button>
                    <p className="text-center text-[11.5px] text-text-tertiary">
                      To <span className="mono text-text-secondary">{short(account)}</span>
                      {primaryName && <> · currently {primaryName}</>}
                    </p>
                  </div>
                )}
                {err && <p className="text-[12.5px] text-danger">{err}</p>}

                <details className="group text-[12px] text-text-tertiary">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-text-secondary hover:text-text-primary">
                    <ShieldCheck size={14} className="text-success" /> What you sign
                    <ChevronDown size={13} className="transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="mt-2.5 space-y-1.5 leading-relaxed">
                    <li>
                      USDC: an approval for the exact total to the <ContractLink address={HLN_MINTER} label="Minter" />, then the mint. Never an unlimited approval.
                    </li>
                    <li>HYPE: one transaction to the Minter, the total plus a 2% margin for the oracle.</li>
                    <li>
                      Before your wallet opens, the page checks that the signed pass is for your name and token at no more than the list price, and that your wallet is
                      still on HyperEVM and on the same account.{" "}
                      <a
                        href="https://github.com/Yaugourt/liquidterminal_front/blob/main/src/services/names/mint.ts"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary hover:text-brand"
                      >
                        Read the code
                      </a>
                      .
                    </li>
                    <li>
                      Name NFT <ContractLink address={HLN_NAMES} label={short(HLN_NAMES)} />, USDC <ContractLink address={HYPEREVM_USDC} label={short(HYPEREVM_USDC)} />.
                      Liquid Terminal never holds your funds.
                    </li>
                  </ul>
                </details>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* The connected wallet's names */}
      {account && owned && owned.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-baseline gap-3">
            <h2 className="text-[14px] font-semibold text-text-primary">Your names</h2>
            <span className="mono text-[11px] text-text-tertiary">{short(account)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {owned.map((n) => {
              const e = expiresIn(n.expiry);
              const primary = primaryName?.toLowerCase() === n.name.toLowerCase();
              return (
                <a
                  key={n.name}
                  href={`${HLN_APP}/profile`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-surface px-3.5 py-2.5 hover:border-brand/40"
                >
                  <span>
                    <span className="flex items-center gap-1.5 text-[14px] font-semibold text-text-primary">
                      {n.name}
                      {primary && <span className="rounded bg-brand/10 px-1.5 py-px text-[9.5px] uppercase tracking-[0.06em] text-brand">Primary</span>}
                    </span>
                    <span className={cn("text-[11.5px]", e.soon ? "text-warning" : "text-text-tertiary")}>{e.text}</span>
                  </span>
                  <ExternalLink size={13} className="text-text-tertiary group-hover:text-brand" />
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Hyperliquid Names, beyond the mint */}
      <div className="flex flex-col gap-3 border-t border-border-subtle pt-5 md:flex-row md:items-center">
        <span className="flex shrink-0 items-center gap-2 text-[12.5px] font-medium text-text-secondary">
          <Image src="/partners/hlnames.svg" alt="" width={22} height={22} />
          Hyperliquid Names
        </span>
        <div className="flex flex-wrap gap-x-5 gap-y-2 md:ml-auto">
          {HLN_LINKS.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12.5px] text-text-tertiary hover:text-brand">
              {l.label} <ExternalLink size={11} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
