"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { getAddress, zeroHash, type Address, type EIP1193Provider, type Hash } from "viem";
import { ArrowRight, AtSign, Check, ExternalLink, Search, ShieldCheck, Wallet, X } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/pill-tabs";
import { AddressIdenticon, CardHead } from "@/components/common";
import { useHlName } from "@/services/names";
import {
  checkLabel,
  forgetCachedName,
  HLN_MINTER,
  HLN_NAMES,
  HYPEREVM_USDC,
  hypeUsd,
  mintName,
  nameOwner,
  priceUsd,
  PRICE_TIERS,
  REFERRAL_DISCOUNT,
  referralHash,
  RENEWAL_USD,
  type MintStep,
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

/** Shown in the preview before a wallet is connected (Liquid Terminal's own address). */
const SAMPLE_ADDRESS = "0x5CF220ac4BAb057B88838a651346164f813b9F89";

/** "$18", "$62.10": cents only when there are some. */
const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const tierIndex = (label: string) => Math.min([...label].length, 4) - 1;

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

/** What the name replaces: the wallet's address, struck through, then the name. */
function NamePreview({ address, name }: { address: string; name: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border-subtle bg-base/60 px-3.5 py-3">
      <AddressIdenticon address={address} size={28} />
      <span className={cn("mono text-[13px]", name ? "text-text-tertiary line-through decoration-text-tertiary/60" : "text-text-secondary")}>
        {short(address)}
      </span>
      <ArrowRight size={14} className="text-text-tertiary" />
      <span className={cn("text-[15px] font-semibold", name ? "text-brand" : "text-text-tertiary")}>{name ?? "yourname.hl"}</span>
    </div>
  );
}

function StepList({ token, step }: { token: PayToken; step: MintStep }) {
  const steps = STEPS.filter((s) => !s.usdcOnly || token === "usdc");
  const current = steps.findIndex((s) => s.id === step);
  return (
    <ol className="space-y-2" aria-live="polite">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2.5 text-[12.5px]">
          <span
            className={cn(
              "grid h-5 w-5 shrink-0 place-items-center rounded-full border mono text-[10px]",
              i < current && "border-success/40 bg-success/10 text-success",
              i === current && "border-brand/50 text-brand",
              i > current && "border-border-default text-text-tertiary"
            )}
          >
            {i < current ? <Check size={11} /> : i === current ? <InlineSpinner className="h-3 w-3" /> : i + 1}
          </span>
          <span className={i === current ? "text-text-primary" : i < current ? "text-text-secondary" : "text-text-tertiary"}>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

function InfoCard({ title, tag, children }: { title: string; tag?: string; children: ReactNode }) {
  return (
    <Card padding="none" className="flex flex-col">
      <CardHead title={title} tag={tag} />
      <div className="flex-1 p-4 text-[12.5px] leading-relaxed text-text-secondary">{children}</div>
    </Card>
  );
}

/**
 * Search and mint a .hl name from Liquid Terminal (Hyperliquid Names Builder
 * Program). Availability is read on chain; the mint is signed in the user's
 * own wallet, in HYPE or USDC, with our referral when it is registered.
 */
export function ClaimHlName({ initial = "" }: { initial?: string }) {
  const [input, setInput] = useState(initial);
  const [token, setToken] = useState<PayToken>("usdc");
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);
  const [account, setAccount] = useState<Address | null>(null);
  const [step, setStep] = useState<MintStep | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [minted, setMinted] = useState<{ name: string; hash: Hash } | null>(null);
  const [referred, setReferred] = useState(false);
  const [hypePx, setHypePx] = useState<number | null>(null);

  const availability = useAvailability(input);
  const currentName = useHlName(account);

  useEffect(() => {
    referralHash().then((h) => setReferred(h !== zeroHash));
    void hypeUsd().then(setHypePx);
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

  const price = useMemo(() => {
    if (availability.state !== "free") return null;
    const full = priceUsd(availability.label);
    return { full, paid: referred ? full * (1 - REFERRAL_DISCOUNT) : full };
  }, [availability, referred]);

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
    if (!provider || !account || availability.state !== "free") return;
    setErr(null);
    try {
      if ((await walletChainId(provider)) !== 999) await switchToHyperEvm(provider);
      const hash = await mintName({ provider, account, label: availability.label, token, onStep: setStep });
      setMinted({ name: availability.name, hash });
      void forgetCachedName(account);
    } catch (e) {
      setErr(walletError(e));
    } finally {
      setStep(null);
    }
  };

  const busy = step !== null;
  const previewName =
    minted?.name ?? (availability.state === "free" ? availability.name : null);
  const typedTier = availability.state === "free" ? tierIndex(availability.label) : null;
  const discountPct = Math.round(REFERRAL_DISCOUNT * 100);

  return (
    <div className="space-y-4">
      <Card padding="none" className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Search */}
          <div className="min-w-0 space-y-4 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              <Search size={13} /> Find your name
              {referred && (
                <span className="ml-auto rounded-md bg-gold/10 px-2 py-0.5 normal-case tracking-normal text-[11px] font-medium text-gold">
                  {discountPct}% off on Liquid Terminal
                </span>
              )}
            </div>

            <label htmlFor="hl-name" className="sr-only">
              Name
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
                  setMinted(null);
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
                <button
                  type="button"
                  onClick={() => setInput("")}
                  aria-label="Clear"
                  className="focus-ring ml-3 rounded-md p-1 text-text-tertiary hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="min-h-[20px] text-[13px]" aria-live="polite">
              {availability.state === "idle" && <span className="text-text-tertiary">Letters, numbers, hyphens and emoji. 1 to 30 characters.</span>}
              {availability.state === "invalid" && <span className="text-danger">{availability.reason}</span>}
              {availability.state === "checking" && (
                <span className="inline-flex items-center gap-1.5 text-text-tertiary">
                  <InlineSpinner className="h-3.5 w-3.5" /> Checking {availability.name} on HyperEVM…
                </span>
              )}
              {availability.state === "taken" && (
                <span className="text-text-secondary">
                  <span className="font-medium text-danger">{availability.name}</span> is taken, held by{" "}
                  <Link href={`/explorer/address/${availability.owner}`} className="mono text-brand hover:underline">
                    {short(availability.owner)}
                  </Link>
                  . Try another one.
                </span>
              )}
              {availability.state === "free" && (
                <span className="inline-flex items-center gap-1.5 font-medium text-success">
                  <Check size={14} /> {availability.name} is available
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">How it shows</p>
              <NamePreview address={account ?? SAMPLE_ADDRESS} name={previewName} />
              <p className="text-[11.5px] text-text-tertiary">
                {account ? (
                  <>
                    Your wallet <span className="mono">{short(account)}</span>
                    {currentName ? <> already shows as {currentName}.</> : <> has no .hl name yet.</>}
                  </>
                ) : (
                  "Connect your wallet to preview it on your own address."
                )}
              </p>
            </div>
          </div>

          {/* Checkout */}
          <div className="min-w-0 border-t border-border-subtle bg-surface-2/40 p-5 md:p-6 lg:border-l lg:border-t-0">
            {minted ? (
              <div className="space-y-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-success/15 text-success">
                  <Check size={18} />
                </span>
                <p className="text-[17px] font-semibold text-text-primary">{minted.name} is yours.</p>
                <p className="text-[12.5px] leading-relaxed text-text-secondary">
                  Set it as your primary name on Hyperliquid Names so it shows instead of your address on Liquid Terminal and across Hyperliquid apps.
                </p>
                <Button asChild variant="ghostBrand" className="w-full">
                  <a href="https://app.hlnames.xyz/profile" target="_blank" rel="noopener noreferrer">
                    Set as primary name <ExternalLink />
                  </a>
                </Button>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
                  <a href={`https://hyperevmscan.io/tx/${minted.hash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-text-tertiary hover:text-brand">
                    Transaction <ExternalLink size={12} />
                  </a>
                  {account && (
                    <Link href={`/explorer/address/${account}`} className="text-text-tertiary hover:text-brand">
                      Your wallet page
                    </Link>
                  )}
                </div>
              </div>
            ) : availability.state === "free" && price ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">{availability.name} · 1 year</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="mono text-[28px] font-semibold tracking-[-0.02em] text-text-primary">{usd(price.paid)}</span>
                    {referred && <span className="mono text-[14px] text-text-tertiary line-through">{usd(price.full)}</span>}
                  </div>
                  {referred && <p className="text-[12px] text-gold">{discountPct}% off, referred by Liquid Terminal</p>}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-text-tertiary">Pay with</span>
                  <PillTabs
                    tabs={[
                      { value: "usdc", label: "USDC" },
                      { value: "native", label: "HYPE" },
                    ]}
                    activeTab={token}
                    onTabChange={(v) => !busy && setToken(v as PayToken)}
                  />
                </div>
                <p className="text-[11.5px] leading-relaxed text-text-tertiary">
                  {token === "usdc" ? (
                    "USDC on HyperEVM. First time: one approval for this exact amount, then the mint."
                  ) : (
                    <>
                      HYPE on HyperEVM at the oracle price
                      {hypePx ? (
                        <>
                          , about <span className="mono text-text-secondary">{(price.paid / hypePx).toFixed(4)} HYPE</span>
                        </>
                      ) : null}
                      . Your wallet sends a 2% margin for price moves.
                    </>
                  )}
                </p>

                {busy && step ? (
                  <StepList token={token} step={step} />
                ) : !provider ? (
                  <p className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[12.5px] text-text-secondary">
                    Open this page in a browser with a wallet extension (Rabby, MetaMask…) to mint.
                  </p>
                ) : !account ? (
                  <Button variant="ghostBrand" className="w-full" onClick={connect}>
                    <Wallet /> Connect wallet
                  </Button>
                ) : (
                  <div className="space-y-1.5">
                    <Button variant="ghostBrand" className="w-full" onClick={mint}>
                      <AtSign /> Mint {availability.name}
                    </Button>
                    <p className="text-[11.5px] text-text-tertiary">
                      To <span className="mono text-text-secondary">{short(account)}</span>
                    </p>
                  </div>
                )}
                {err && <p className="text-[12.5px] text-danger">{err}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">Price per year</p>
                <ul className="divide-y divide-border-subtle">
                  {PRICE_TIERS.map((t, i) => {
                    const paid = referred ? t.usd * (1 - REFERRAL_DISCOUNT) : t.usd;
                    return (
                      <li key={t.length} className={cn("flex items-baseline justify-between py-2 text-[13px]", typedTier === i && "text-brand")}>
                        <span className="text-text-secondary">{t.length}</span>
                        <span className="flex items-baseline gap-2">
                          {referred && <span className="mono text-[11.5px] text-text-tertiary line-through">{usd(t.usd)}</span>}
                          <span className="mono font-medium text-text-primary">{usd(paid)}</span>
                        </span>
                      </li>
                    );
                  })}
                  <li className="flex items-baseline justify-between py-2 text-[13px]">
                    <span className="text-text-secondary">Renewal</span>
                    <span className="mono text-text-primary">{usd(RENEWAL_USD)}</span>
                  </li>
                </ul>
                <p className="text-[11.5px] text-text-tertiary">Type a name to see its price and mint it in USDC or HYPE.</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard title="How it works">
          <ol className="space-y-3">
            {[
              ["Search", "Availability is read on chain, from the Hyperliquid Names contract."],
              ["Mint from your wallet", "Pay in USDC or HYPE on HyperEVM. Liquid Terminal never holds your funds."],
              ["Set it as primary", "On Hyperliquid Names, so apps show it instead of your address."],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-brand/40 mono text-[10px] text-brand">{i + 1}</span>
                <span>
                  <span className="block font-medium text-text-primary">{title}</span>
                  <span className="text-text-tertiary">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </InfoCard>

        <InfoCard title="What you sign" tag="open source">
          <ul className="space-y-2.5">
            <li className="flex gap-2">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-success" />
              <span>
                USDC: an approval for the exact price to the <ContractLink address={HLN_MINTER} label="Minter" />, then the mint. Never an unlimited approval.
              </span>
            </li>
            <li className="flex gap-2">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-success" />
              <span>
                HYPE: one transaction to the <ContractLink address={HLN_MINTER} label="Minter" />, the price plus a 2% oracle margin.
              </span>
            </li>
            <li className="flex gap-2">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-success" />
              <span className="text-text-tertiary">
                Before your wallet opens, the page checks the signed pass is for your name and token at no more than the list price, and that your wallet is still on HyperEVM and the same account.{" "}
                <a
                  href="https://github.com/Yaugourt/liquidterminal_front/blob/main/src/services/names/mint.ts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-brand"
                >
                  Read the code
                </a>
              </span>
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Where your name shows">
          <ul className="space-y-2">
            <li>On Liquid Terminal: wallet pages, address columns and search.</li>
            <li>In alerts from our Telegram bot.</li>
            <li>In every app that reads Hyperliquid Names.</li>
          </ul>
          <p className="mt-3 text-[11.5px] text-text-tertiary">
            The name is an NFT on HyperEVM (<ContractLink address={HLN_NAMES} label={short(HLN_NAMES)} />), paid in USDC (
            <ContractLink address={HYPEREVM_USDC} label={short(HYPEREVM_USDC)} />) or HYPE.
          </p>
        </InfoCard>
      </div>
    </div>
  );
}
