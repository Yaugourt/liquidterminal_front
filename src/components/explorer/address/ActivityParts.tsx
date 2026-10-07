"use client";

import { memo } from "react";
import Link from "next/link";
import { HlAddressText, TokenAvatar } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Activity, ActivityKind } from "@/services/explorer/address";
import { cn } from "@/lib/utils";

/**
 * Display pieces of a decoded HyperCore activity, shared by the address
 * activity table, the block transaction list and the transaction page.
 */

export const KIND_LABEL: Record<ActivityKind, string> = {
  trade: "Trade",
  order: "Order",
  transfer: "Transfer",
  bridge: "Bridge",
  staking: "Staking",
  vault: "Vault",
  account: "Account",
  evm: "HyperEVM",
  system: "System",
};

export const TONE_DOT: Record<Activity["tone"], string> = {
  up: "bg-success",
  down: "bg-danger",
  neutral: "bg-text-tertiary",
};

const ROLE_WORD: Record<string, string> = {
  to: "to",
  from: "from",
  validator: "validator",
  vault: "vault",
  agent: "agent",
  builder: "builder",
  "sub-account": "sub-account",
};

export function ago(t: number): string {
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/** Quantity with precision that follows its size (1,234 · 0.00421). */
export function qty(n: number): string {
  const a = Math.abs(n);
  const digits = a >= 1000 ? 0 : a >= 1 ? 4 : 6;
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

const price = (n: number) => `$${n.toLocaleString("en-US", { maximumSignificantDigits: 6 })}`;
export const signedUsd = (n: number) => `${n >= 0 ? "+" : "−"}${compactUsd(Math.abs(n))}`;

export function AssetChip({ asset }: { asset: NonNullable<Activity["asset"]> }) {
  const market = asset.market;
  const avatar = "coin" in asset ? (market === "spot" ? `${asset.label}_spot` : asset.coin) : asset.label;
  const href =
    "coin" in asset
      ? market === "spot"
        ? `/market/spot/${encodeURIComponent(asset.label)}`
        : `/market/perp/${encodeURIComponent(asset.coin)}`
      : null;
  const body = (
    <>
      <TokenAvatar assetName={avatar} size="xs" />
      <span className="font-medium text-text-primary">{asset.label}</span>
      {market === "hip3" && "dex" in asset && asset.dex && (
        <span className="text-[9.5px] font-semibold uppercase tracking-wide px-1 rounded bg-gold/10 text-gold">{asset.dex}</span>
      )}
      {market === "spot" && (
        <span className="text-[9.5px] font-semibold uppercase tracking-wide px-1 rounded bg-surface-2 text-text-tertiary">spot</span>
      )}
    </>
  );
  return href ? (
    <Link href={href} className="inline-flex items-center gap-1 hover:text-brand">
      {body}
    </Link>
  ) : (
    <span className="inline-flex items-center gap-1">{body}</span>
  );
}

/** Action verb with its tone dot, and the kind (or the rejection reason) under it. */
export function ActionLabel({ a }: { a: Activity }) {
  return (
    <div className="flex items-start gap-2 min-w-[132px]">
      <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", a.failed ? "bg-danger" : TONE_DOT[a.tone])} />
      <div className="min-w-0">
        <div className={cn("text-[12.5px] font-semibold", a.failed ? "text-text-tertiary line-through decoration-danger/60" : "text-text-primary")}>
          {a.label}
        </div>
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
          {a.failed ? (
            <span className="text-danger normal-case tracking-normal" title={a.failed}>
              Rejected: {a.failed.length > 48 ? `${a.failed.slice(0, 47)}…` : a.failed}
            </span>
          ) : (
            KIND_LABEL[a.kind]
          )}
        </div>
      </div>
    </div>
  );
}

/** What the action was about: size, market, price, counterparty, then qualifiers, PnL and fee. */
export const ActivityDetails = memo(function ActivityDetails({ a, currentAddress }: { a: Activity; currentAddress?: string }) {
  const cp = a.counterparty;
  const showCp = cp && cp.address.toLowerCase() !== currentAddress?.toLowerCase();
  return (
    <div className="min-w-0 text-[12px] leading-snug">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        {a.size != null && a.size !== 0 && <span className="mono text-text-primary">{qty(a.size)}</span>}
        {a.asset && <AssetChip asset={a.asset} />}
        {a.price != null && a.price > 0 && <span className="mono text-text-secondary">@ {price(a.price)}</span>}
        {showCp && (
          <span className="inline-flex items-center gap-1 text-text-tertiary">
            {ROLE_WORD[cp.role]}
            <Link href={`/explorer/address/${cp.address}`} className={cn("text-brand hover:underline", !cp.name && "mono")} title={cp.address}>
              {cp.name ?? <HlAddressText address={cp.address} />}
            </Link>
          </span>
        )}
      </div>
      {(a.details.length > 0 || a.pnl != null || a.fee != null) && (
        <div className="flex flex-wrap items-center gap-x-1.5 mt-0.5 text-[11px] text-text-tertiary">
          {a.details.map((d, i) => (
            <span key={i} className={d === "not filled" ? "text-warning" : undefined}>
              {i > 0 && "· "}
              {d}
            </span>
          ))}
          {a.pnl != null && (
            <span className={a.pnl >= 0 ? "text-success" : "text-danger"}>
              {a.details.length > 0 && "· "}PnL {signedUsd(a.pnl)}
            </span>
          )}
          {a.fee != null && a.fee !== 0 && (
            <span>
              · fee {a.fee.toLocaleString("en-US", { maximumFractionDigits: 4 })} {a.feeToken ?? ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

/** USD value, signed and coloured by flow; "~" when estimated at the current price. */
export function ActivityValue({ a }: { a: Activity }) {
  if (a.usd == null || !(a.usd > 0)) return <span className="text-text-tertiary">–</span>;
  return (
    <span
      className={cn("mono text-[12.5px] whitespace-nowrap", a.flow > 0 ? "text-success" : a.flow < 0 ? "text-danger" : "text-text-primary")}
      title={a.estimated ? "Estimated at the current price" : undefined}
    >
      {a.flow > 0 ? "+" : a.flow < 0 ? "−" : a.estimated ? "~" : ""}
      {compactUsd(a.usd)}
    </span>
  );
}
