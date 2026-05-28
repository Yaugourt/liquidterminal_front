"use client";

import { memo } from "react";
import { useDashboardStats } from "@/services/dashboard";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { KpiRibbon, type KpiCell } from "@/components/common";

/**
 * PulseBar — horizontal KPI ribbon for the Dashboard.
 * Continuous strip of 4 cells on a single row, value-only.
 */
export const PulseBar = memo(function PulseBar() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { stats: perpStats } = usePerpGlobalStats();
  const { format } = useNumberFormat();

  const loadingPlaceholder = "…";
  const emptyPlaceholder = "—";

  const formatCount = (value: number | null | undefined): string => {
    if (value == null || !Number.isFinite(value)) return emptyPlaceholder;
    return formatNumber(value, format, { maximumFractionDigits: 0 });
  };

  const kpis: KpiCell[] = [
    {
      label: "24h Volume",
      value: statsLoading && !stats ? loadingPlaceholder : compactUsd(stats?.dailyVolume),
    },
    {
      label: "Open Interest",
      value: compactUsd(perpStats?.totalOpenInterest),
    },
    {
      label: "Vaults TVL",
      value: statsLoading && !stats ? loadingPlaceholder : compactUsd(stats?.vaultsTvl),
    },
    {
      label: "HYPE Staked",
      value: statsLoading && !stats ? loadingPlaceholder : formatCount(stats?.totalHypeStake),
    },
  ];

  return <KpiRibbon cells={kpis} columns="grid-cols-2 sm:grid-cols-4" />;
});
