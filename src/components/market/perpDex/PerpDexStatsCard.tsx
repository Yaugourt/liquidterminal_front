"use client";

import { memo } from "react";
import { KpiRibbon, type KpiCell, type KpiTone } from "@/components/common";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { useNumberFormat } from "@/store/number-format.store";

const usdFormat = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  currency: "$",
  showCurrency: true,
} as const;

export const PerpDexStatsCard = memo(function PerpDexStatsCard() {
  const { globalStats, isLoading } = usePerpDexMarketData();
  const { format } = useNumberFormat();

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
          ? formatNumber(globalStats.totalVolume24h, format, usdFormat)
          : "—"
      ),
    },
    {
      label: "Open Interest",
      value: val(
        globalStats?.totalOpenInterest
          ? formatNumber(globalStats.totalOpenInterest, format, usdFormat)
          : "—"
      ),
    },
    {
      label: "Total OI Cap",
      value: val(
        globalStats?.totalOiCap
          ? formatNumber(globalStats.totalOiCap, format, usdFormat)
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
