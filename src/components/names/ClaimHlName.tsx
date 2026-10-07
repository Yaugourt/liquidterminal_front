"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { zeroHash, type Address, type EIP1193Provider, type Hash } from "viem";
import { AtSign, Check, ExternalLink, Wallet } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardHead } from "@/components/common";
import { useHlName } from "@/services/names";
import {
  checkLabel,
  forgetCachedName,
  HLN_NAMES,
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

const STEP_TEXT: Record<MintStep, string> = {
  pass: "Getting a signed mint pass from Hyperliquid Names…",
  approve: "Approve USDC in your wallet (one time for this amount)…",
  confirm: "Confirm the mint in your wallet…",
  pending: "Minting on HyperEVM…",
};

const usd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

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

  const availability = useAvailability(input);
  const currentName = useHlName(account);

  useEffect(() => {
    referralHash().then((h) => setReferred(h !== zeroHash));
    const p = injectedWallet();
    setProvider(p);
    if (!p) return;
    const onAccounts = (a: unknown) => setAccount(((a as string[])[0] as Address) ?? null);
    p.on("accountsChanged", onAccounts as never);
    return () => p.removeListener("accountsChanged", onAccounts as never);
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

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
      <Card padding="none">
        <CardHead title="Find your name" tag="Hyperliquid Names" />
        <div className="space-y-4 p-4">
          <label htmlFor="hl-name" className="sr-only">
            Name
          </label>
          <div
            className={cn(
              "flex items-center rounded-lg border bg-surface-2 px-3 transition-colors focus-within:border-brand/50",
              availability.state === "taken" || availability.state === "invalid" ? "border-danger/40" : availability.state === "free" ? "border-success/40" : "border-border-default"
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
              spellCheck={false}
              autoFocus
              disabled={busy}
              className="h-12 min-w-0 flex-1 bg-transparent text-lg font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <span className="mono text-lg text-text-tertiary">.hl</span>
          </div>

          <div className="min-h-[20px] text-[13px]" aria-live="polite">
            {availability.state === "invalid" && <span className="text-danger">{availability.reason}</span>}
            {availability.state === "checking" && (
              <span className="inline-flex items-center gap-1.5 text-text-tertiary">
                <InlineSpinner className="h-3.5 w-3.5" /> Checking {availability.name}…
              </span>
            )}
            {availability.state === "taken" && (
              <span className="text-text-secondary">
                <span className="font-medium text-text-primary">{availability.name}</span> is taken, held by{" "}
                <Link href={`/explorer/address/${availability.owner}`} className="mono text-brand hover:underline">
                  {short(availability.owner)}
                </Link>
                .
              </span>
            )}
            {availability.state === "free" && (
              <span className="inline-flex items-center gap-1.5 text-success">
                <Check size={14} /> {availability.name} is available
              </span>
            )}
          </div>

          {availability.state === "free" && price && !minted && (
            <div className="space-y-3 rounded-lg border border-border-subtle bg-surface-2/50 p-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[12px] uppercase tracking-[0.06em] text-text-tertiary">1 year</span>
                <span className="flex items-baseline gap-2">
                  {referred && <span className="mono text-[13px] text-text-tertiary line-through">{usd(price.full)}</span>}
                  <span className="mono text-xl font-semibold text-text-primary">{usd(price.paid)}</span>
                </span>
              </div>
              {referred && <p className="text-[12px] text-gold">10% off, referred by Liquid Terminal.</p>}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] text-text-tertiary">Pay with</span>
                <PillTabs
                  tabs={[
                    { value: "usdc", label: "USDC" },
                    { value: "native", label: "HYPE" },
                  ]}
                  activeTab={token}
                  onTabChange={(v) => setToken(v as PayToken)}
                />
              </div>
              <p className="text-[11.5px] leading-relaxed text-text-tertiary">
                {token === "usdc"
                  ? "Paid in USDC on HyperEVM. First time: one approval, then the mint."
                  : "Paid in HYPE on HyperEVM at the oracle price. Your wallet sends a 2% margin for price moves."}
              </p>

              {!provider ? (
                <p className="text-[12.5px] text-text-secondary">Open this page in a browser with a wallet (Rabby, MetaMask…) to mint.</p>
              ) : !account ? (
                <Button variant="ghostBrand" className="w-full" onClick={connect}>
                  <Wallet /> Connect wallet
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button variant="ghostBrand" className="w-full" onClick={mint} disabled={busy}>
                    {busy ? <InlineSpinner /> : <AtSign />}
                    {busy ? "Minting…" : `Mint ${availability.name}`}
                  </Button>
                  <p className="text-[11.5px] text-text-tertiary">
                    To <span className="mono text-text-secondary">{short(account)}</span>
                    {currentName && <> · this wallet already has {currentName}</>}
                  </p>
                </div>
              )}
              {step && <p className="text-[12.5px] text-text-secondary">{STEP_TEXT[step]}</p>}
              {err && <p className="text-[12.5px] text-danger">{err}</p>}
            </div>
          )}

          {minted && (
            <div className="space-y-2 rounded-lg border border-success/30 bg-success/10 p-3.5">
              <p className="text-[14px] font-semibold text-text-primary">{minted.name} is yours.</p>
              <p className="text-[12.5px] text-text-secondary">
                To show it instead of your address across Hyperliquid apps, set it as your primary name on Hyperliquid Names.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
                <a href="https://app.hlnames.xyz/profile" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">
                  Set as primary name <ExternalLink size={12} />
                </a>
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
          )}
        </div>
      </Card>

      <Card padding="none">
        <CardHead title="Pricing" tag="per year" />
        <div className="space-y-4 p-4">
          <ul className="space-y-1.5">
            {PRICE_TIERS.map((t) => (
              <li key={t.length} className="flex items-baseline justify-between text-[13px]">
                <span className="text-text-secondary">{t.length}</span>
                <span className="mono text-text-primary">{usd(t.usd)}</span>
              </li>
            ))}
            <li className="flex items-baseline justify-between border-t border-border-subtle pt-1.5 text-[13px]">
              <span className="text-text-secondary">Renewal</span>
              <span className="mono text-text-primary">{usd(RENEWAL_USD)}</span>
            </li>
          </ul>
          <div className="space-y-2 text-[12px] leading-relaxed text-text-tertiary">
            <p>Your .hl name replaces your 0x address on Liquid Terminal, in alerts from our Telegram bot and in every app that reads Hyperliquid Names.</p>
            <p>
              The name is an NFT on HyperEVM (
              <a href={`https://hyperevmscan.io/address/${HLN_NAMES}`} target="_blank" rel="noopener noreferrer" className="mono text-text-secondary hover:text-brand">
                {short(HLN_NAMES)}
              </a>
              ), minted from your own wallet through the Hyperliquid Names Builder Program. Liquid Terminal never holds your funds.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
