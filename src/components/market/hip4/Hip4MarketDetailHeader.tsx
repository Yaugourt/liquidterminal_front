"use client";

import Link from "next/link";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import type { Hip4MarketEnrichedRow } from "@/services/indexer/hip4";
import { formatMarketTitle, formatExpiryCountdown } from "@/lib/hip4/market-formatter";

function compactUsd(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

interface Hip4MarketDetailHeaderProps {
  market: Hip4MarketEnrichedRow;
}

export function Hip4MarketDetailHeader({ market }: Hip4MarketDetailHeaderProps) {
  const title = formatMarketTitle(market);
  const countdown = formatExpiryCountdown(market.expiry ?? null);
  const yesProb =
    market.mid_price != null && Number.isFinite(market.mid_price)
      ? (market.mid_price * 100).toFixed(1)
      : null;
  const noProb = yesProb != null ? (100 - parseFloat(yesProb)).toFixed(1) : null;

  return (
    <div className="space-y-3">
      <Link
        href="/market/hip4"
        className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        HIP-4 Markets
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold text-white leading-snug">{title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-secondary">
            {countdown && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {countdown}
              </span>
            )}
            {market.underlying && (
              <span className="bg-white/[0.04] border border-border-subtle rounded px-1.5 py-0.5 font-medium">
                {market.underlying}
              </span>
            )}
            {market.period && (
              <span className="text-text-muted">{market.period} period</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {yesProb && (
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-xs text-text-muted mb-0.5">Yes</div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">{yesProb}%</div>
              </div>
              <div className="h-8 w-px bg-border-subtle" />
              <div className="text-center">
                <div className="text-xs text-text-muted mb-0.5">No</div>
                <div className="text-lg font-bold text-rose-400 tabular-nums">{noProb}%</div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1 pl-3 border-l border-border-subtle">
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
              <TrendingUp className="h-3 w-3" />
              <span>Volume</span>
            </div>
            <div className="text-sm font-semibold text-white tabular-nums">
              {compactUsd(market.total_volume)}
            </div>
          </div>

          {market.is_settled ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              Settled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-brand-accent/25 bg-brand-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
