"use client";

import Link from "next/link";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Hip4MarketEnrichedRow } from "@/services/indexer/hip4";
import { formatMarketTitle, formatExpiryCountdown } from "@/lib/hip4/market-formatter";

interface Hip4MarketDetailHeaderProps {
  market: Hip4MarketEnrichedRow;
}

export function Hip4MarketDetailHeader({ market }: Hip4MarketDetailHeaderProps) {
  const title = formatMarketTitle(market);
  const countdown = formatExpiryCountdown(market.expiry ?? null);
  // Yes/No probability is only meaningful for binary markets. Multi-outcome
  // priceBucket questions reuse mid_price as the implied probability of THIS
  // outcome, not a Yes/No coinflip — labelling it Yes/No would be misleading.
  const isBinary = market.class_normalized === "binary";
  const yesProb =
    isBinary && market.mid_price != null && Number.isFinite(market.mid_price)
      ? (market.mid_price * 100).toFixed(1)
      : null;
  const noProb = yesProb != null ? (100 - parseFloat(yesProb)).toFixed(1) : null;
  const outcomeProb =
    !isBinary && market.mid_price != null && Number.isFinite(market.mid_price)
      ? (market.mid_price * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-3">
      <Link
        href="/market/hip4"
        className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        HIP-4 Markets
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-[22px] font-semibold text-text-primary tracking-[-0.02em] leading-snug">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-secondary">
            {countdown && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {countdown}
              </span>
            )}
            {market.underlying && (
              <span className="bg-surface-2 border border-border-subtle rounded px-1.5 py-0.5 font-medium">
                {market.underlying}
              </span>
            )}
            {market.period && (
              <span className="text-text-tertiary">{market.period} period</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {yesProb && (
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-0.5">Yes</div>
                <div className="mono text-[18px] font-semibold text-success">{yesProb}%</div>
              </div>
              <div className="h-8 w-px bg-border-subtle" />
              <div className="text-center">
                <div className="text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-0.5">No</div>
                <div className="mono text-[18px] font-semibold text-danger">{noProb}%</div>
              </div>
            </div>
          )}

          {outcomeProb && (
            <div className="text-center">
              <div className="text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-0.5">Implied</div>
              <div className="mono text-[18px] font-semibold text-brand">{outcomeProb}%</div>
            </div>
          )}

          <div className="flex flex-col gap-0.5 pl-3 border-l border-border-subtle">
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
              <TrendingUp className="h-3 w-3" />
              <span>Volume</span>
            </div>
            <div className="mono text-[14px] font-semibold text-text-primary">
              {compactUsd(market.total_volume)}
            </div>
          </div>

          {market.is_settled ? (
            <span className="inline-flex items-center gap-1 rounded bg-surface-2 border border-border-subtle px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Settled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded bg-success/10 border border-success/25 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
