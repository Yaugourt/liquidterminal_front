"use client";

import { memo } from "react";
import { KpiRibbon, ShareTile, type KpiCell, type KpiTone } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";

export const PerpDexStatsCard = memo(function PerpDexStatsCard() {
  const { globalStats, isLoading } = usePerpDexMarketData();

  const avgFunding = globalStats?.avgFunding ?? 0;
  const loadingPlaceholder = isLoading && !globalStats ? "…" : null;

  const val = (formatted: string) =>
    loadingPlaceholder !== null ? loadingPlaceholder : formatted;

  const cells: KpiCell[] = [
    {
      label: "Active DEXs",
      value: val(globalStats ? String(globalStats.totalDexs) : "—"),
    },
    {
      label: "Active Markets",
      value: val(
        globalStats
          ? `${globalStats.activeMarkets} / ${globalStats.totalAssets}`
          : "—"
      ),
    },
    {
      label: "24h Volume",
      value: val(
        globalStats?.totalVolume24h
          ? compactUsd(globalStats.totalVolume24h)
          : "—"
      ),
    },
    {
      label: "Open Interest",
      value: val(
        globalStats?.totalOpenInterest
          ? compactUsd(globalStats.totalOpenInterest)
          : "—"
      ),
    },
    {
      label: "Total OI Cap",
      value: val(
        globalStats?.totalOiCap
          ? compactUsd(globalStats.totalOiCap)
          : "—"
      ),
    },
    {
      label: "Avg Funding",
      value: val(
        globalStats?.avgFunding
          ? `${(globalStats.avgFunding * 100).toFixed(4)}%`
          : "0.0000%"
      ),
      // Original applied the directional color even during the loading "…"
      // (avgFunding defaults to 0 → success), so we mirror that exactly.
      tone: avgFunding >= 0 ? ("success" as KpiTone) : ("danger" as KpiTone),
    },
  ];

  return (
    // This card is a bare KpiRibbon with no card-head, so the copy-as-image
    // tile is pinned to the ribbon's corner over the last cell (outside the ribbon's
    // own overflow-hidden container so it is never clipped).
    <div className="relative">
      <KpiRibbon cells={cells} columns="grid-cols-2 xl:grid-cols-6" />
      <ShareTile
        src="/api/tile/hip3"
        filename="hip3-ecosystem"
        label="Copy HIP-3 ecosystem as image"
        // Bottom-right below xl: the last cell sits there, the top-right one
        // (active markets) would be covered.
        className="absolute bottom-1.5 right-1.5 xl:bottom-auto xl:top-1.5"
      />
    </div>
  );
});
