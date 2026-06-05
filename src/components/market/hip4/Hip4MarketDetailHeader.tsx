"use client";

import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import type { Hip4MarketEnrichedRow } from "@/services/indexer/hip4";
import type { Hip4EffectiveStatus } from "@/lib/hip4/market-formatter";
import { formatMarketTitle } from "@/lib/hip4/market-formatter";

interface Hip4MarketDetailHeaderProps {
  market: Hip4MarketEnrichedRow;
  /** Parent-question title (overrides the per-side coin name for versus/multi). */
  title?: string;
  /** Market-type tag from the layout resolver (e.g. "Versus", "3 outcomes"). */
  typeLabel?: string;
  /** Lifecycle status — richer than `market.is_settled` alone. */
  status?: Hip4EffectiveStatus;
}

const STATUS_BADGE: Record<
  Hip4EffectiveStatus,
  { label: string; className: string; pulse: boolean }
> = {
  live: {
    label: "Live",
    className: "bg-success/10 border-success/25 text-success",
    pulse: true,
  },
  expired_unresolved: {
    label: "Awaiting resolution",
    className: "bg-gold/10 border-gold/25 text-gold",
    pulse: false,
  },
  settled: {
    label: "Settled",
    className: "bg-surface-2 border-border-subtle text-text-tertiary",
    pulse: false,
  },
};

/**
 * Lean detail-page header — back link, title, market-type tag and lifecycle
 * status. The numeric stats (implied %, volume, expiry) now live in the
 * `<Hip4DetailKpiRibbon>` directly below it, so the header stays uncluttered.
 */
export function Hip4MarketDetailHeader({
  market,
  title,
  typeLabel,
  status,
}: Hip4MarketDetailHeaderProps) {
  const heading = title || formatMarketTitle(market);
  const badge = STATUS_BADGE[status ?? (market.is_settled ? "settled" : "live")];

  return (
    <div className="space-y-3">
      <Link
        href="/market/hip4"
        className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-3 w-3" />
        HIP-4 Markets
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-[22px] font-semibold leading-snug tracking-[-0.02em] text-text-primary">
            {heading}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {typeLabel && (
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-text-tertiary">
                {typeLabel}
              </span>
            )}
            {market.underlying && (
              <span className="rounded border border-border-subtle bg-surface-2 px-1.5 py-0.5 font-medium text-text-secondary">
                {market.underlying}
              </span>
            )}
            {market.period && (
              <span className="inline-flex items-center gap-1 text-text-tertiary">
                <Clock className="h-3 w-3" />
                {market.period} cycle
              </span>
            )}
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${badge.className}`}
        >
          {badge.pulse && <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />}
          {badge.label}
        </span>
      </div>
    </div>
  );
}
