"use client";

import { memo } from "react";
import { useDashboardStats } from "@/services/dashboard";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { KpiRibbon, HypeMark, type KpiCell } from "@/components/common";
import { Hypurr } from "@/components/hypurr/Hypurr";
import { useHypeMood } from "@/components/hypurr/useHypeMood";

/**
 * PulseBar — horizontal KPI ribbon for the Dashboard.
 * Continuous strip of 4 cells on a single row, value-only.
 */
export const PulseBar = memo(function PulseBar() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { stats: perpStats } = usePerpGlobalStats();
  const { format } = useNumberFormat();
  const { mood, label: moodLabel } = useHypeMood();

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
      label: (
        <span className="inline-flex items-center gap-1">
          <HypeMark logoOnly size="xs" />
          HYPE Staked
        </span>
      ),
      value: statsLoading && !stats ? loadingPlaceholder : formatCount(stats?.totalHypeStake),
    },
  ];

  return (
    <div className="relative">
      {mood && (
        // Resting pose of the old peek animation, hard-coded: -54px of offset
        // plus its 64% translate. See Hypurr for why the animation is gone.
        <div className="absolute -top-[18px] right-4 z-0 hidden md:block" title={moodLabel ?? undefined}>
          <Hypurr mood={mood} height={56} />
        </div>
      )}
      <div className="relative z-10">
        <KpiRibbon cells={kpis} columns="grid-cols-2 sm:grid-cols-4" />
      </div>
    </div>
  );
});
