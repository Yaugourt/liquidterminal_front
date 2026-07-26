"use client";

import { memo } from "react";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartError, ChartLoading, KpiRibbon } from "@/components/common";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";

/**
 * The operating side of the business: what the venue moved, what it holds open
 * and how many accounts did it.
 *
 * Turnover is the one derived figure here — 24h volume over open interest, how
 * many times the book turns in a day. Both legs come from the same perp
 * snapshot, so the ratio is internally consistent.
 *
 * There is deliberately no take rate. Revenue is a daily series and volume is a
 * rolling 24h snapshot; dividing one by the other mixes two windows, and the
 * only public volume series on a matching basis measures the spot DEX rather
 * than traded notional. It arrives with a volume history of our own.
 *
 * There is no account count either. The nearest endpoint is a top-traders
 * leaderboard: its `totalCount` reports the size of the ranked pool and is
 * capped at 100, so it reads "100 active traders" no matter how many accounts
 * traded. A number that never moves is worse than an absent one.
 */
export const OperatingMetricsCard = memo(function OperatingMetricsCard() {
  const { stats: perp, isLoading: loadingPerp, error: perpError } = usePerpGlobalStats();
  const { stats: spot, isLoading: loadingSpot, error: spotError } = useSpotGlobalStats();
  const turnover =
    perp?.totalVolume24h && perp?.totalOpenInterest
      ? perp.totalVolume24h / perp.totalOpenInterest
      : null;

  const isLoading = (loadingPerp || loadingSpot) && !perp && !spot;
  const error = perpError ?? spotError;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Activity size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Operating Metrics</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono ml-auto">
          live · 24h
        </span>
      </div>

      <div className="flex-1 px-3.5 py-3">
        {error ? (
          <ChartError />
        ) : isLoading ? (
          <ChartLoading />
        ) : (
          <div className="space-y-3">
            <KpiRibbon
              header={{ label: "Perpetuals", helper: "The core venue" }}
              cells={[
                { label: "Volume 24h", value: compactUsd(perp?.totalVolume24h ?? null) },
                { label: "Open interest", value: compactUsd(perp?.totalOpenInterest ?? null) },
                {
                  label: "Turnover",
                  value: turnover == null ? "—" : `${turnover.toFixed(2)}×`,
                  sub: "volume ÷ open interest",
                },
                {
                  label: "Markets",
                  value: perp?.totalPairs == null ? "—" : compactCount(perp.totalPairs),
                },
                { label: "HLP TVL", value: compactUsd(perp?.hlpTvl ?? null) },
              ]}
            />
            <KpiRibbon
              header={{ label: "Spot & accounts", helper: "The rest of the book" }}
              cells={[
                { label: "Spot volume 24h", value: compactUsd(spot?.totalVolume24h ?? null) },
                {
                  label: "Spot pairs",
                  value: spot?.totalPairs == null ? "—" : compactCount(spot.totalPairs),
                },
                { label: "USDC on spot", value: compactUsd(spot?.totalSpotUSDC ?? null) },
              ]}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: Hyperliquid info API via our backend</span>
        <span className="opacity-50">·</span>
        <span>Turnover is derived from the same snapshot as its two legs.</span>
        <span className="opacity-50">·</span>
        <span>No account count: no source we hold reports one that moves.</span>
      </div>
    </Card>
  );
});
