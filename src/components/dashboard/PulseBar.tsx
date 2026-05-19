"use client";

import { memo, useMemo } from "react";
import { useDashboardStats } from "@/services/dashboard";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { useFeesHistory } from "@/services/market/fees/hooks/useFeesHistory";
import { useAssistanceFund } from "@/services/market/assistanceFund/hooks";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { chartPalette } from "@/components/common";

interface KpiCell {
  label: string;
  value: string;
  /** Série optionnelle — affiche une fine sparkline en bas de la cellule. */
  spark?: number[];
}

/**
 * PulseBar — bandeau de KPI horizontal du Dashboard.
 * Ruban continu de 6 cellules sur une ligne. La cellule « 24h Fees » porte
 * une fine sparkline de la tendance des frais ; les autres sont valeur seule.
 */
export const PulseBar = memo(function PulseBar() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { stats: perpStats } = usePerpGlobalStats();
  const { feesStats } = useFeesStats();
  const { feesHistory } = useFeesHistory();
  const { data: fund } = useAssistanceFund();
  const { format } = useNumberFormat();

  const loadingPlaceholder = "…";
  const emptyPlaceholder = "—";

  const formatCount = (value: number | null | undefined): string => {
    if (value == null || !Number.isFinite(value)) return emptyPlaceholder;
    return formatNumber(value, format, { maximumFractionDigits: 0 });
  };

  /** Frais par intervalle (delta du cumul) — pour la sparkline de la cellule Fees. */
  const feeTrend = useMemo<number[]>(() => {
    if (!feesHistory || feesHistory.length < 2) return [];
    const sorted = [...feesHistory].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    const deltas: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const d = sorted[i].total_fees - sorted[i - 1].total_fees;
      deltas.push(d > 0 ? d : 0);
    }
    return deltas.slice(-32);
  }, [feesHistory]);

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
    {
      label: "24h Fees",
      value: compactUsd(feesStats?.dailyFees),
      spark: feeTrend,
    },
    {
      label: "Assistance Fund",
      value: compactUsd(fund?.hypeValueUsd),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-px bg-border-subtle border border-border-default rounded-lg overflow-hidden">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-surface hover:bg-surface-2 transition-colors px-4 py-3 flex flex-col"
        >
          <div className="text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold truncate">
            {kpi.label}
          </div>
          <div className="mono text-[20px] font-semibold tracking-[-0.02em] leading-none text-text-primary mt-1.5">
            {kpi.value}
          </div>
          {kpi.spark && kpi.spark.length > 1 && (
            <Sparkline
              data={kpi.spark}
              color={chartPalette.gold}
              height={20}
              className="mt-auto pt-2"
            />
          )}
        </div>
      ))}
    </div>
  );
});
