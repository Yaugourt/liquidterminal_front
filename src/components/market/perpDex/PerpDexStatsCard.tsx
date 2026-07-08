"use client";

import { memo } from "react";
import { KpiRibbon, type KpiCell, type KpiTone } from "@/components/common";
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
    <KpiRibbon cells={cells} columns="grid-cols-2 xl:grid-cols-6" />
  );
});
