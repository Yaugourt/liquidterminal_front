"use client";

import { memo } from "react";
import { useDashboardStats } from "@/services/dashboard";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface KpiCell {
  label: string;
  value: string;
}

/**
 * PulseBar — bandeau de KPI horizontal du Dashboard.
 * Ruban continu (1 conteneur, 8 cellules), sans sparkline ni delta :
 * l'API ne fournit pas d'historique par métrique.
 */
export const PulseBar = memo(function PulseBar() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { stats: perpStats } = usePerpGlobalStats();
  const { stats: spotStats } = useSpotGlobalStats();
  const { feesStats } = useFeesStats();
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
      label: "24h Fees",
      value: compactUsd(feesStats?.dailyFees),
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
      label: "Users",
      value: statsLoading && !stats ? loadingPlaceholder : formatCount(stats?.numberOfUsers),
    },
    {
      label: "Spot Market Cap",
      value: compactUsd(spotStats?.totalMarketCap),
    },
    {
      label: "Bridged USDC",
      value: statsLoading && !stats ? loadingPlaceholder : compactUsd(stats?.bridgedUsdc),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-8 bg-surface border border-border-subtle rounded-lg overflow-hidden">
      {kpis.map((kpi, index) => (
        <div
          key={kpi.label}
          className={[
            "px-4 py-3 border-border-subtle",
            // pas de filet gauche sur la 1ère cellule de chaque rangée
            index % 2 !== 0 ? "border-l" : "",
            index % 3 !== 0 ? "sm:border-l" : "sm:border-l-0",
            index !== 0 ? "xl:border-l" : "xl:border-l-0",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="text-[10px] uppercase tracking-[0.09em] text-text-tertiary font-medium">
            {kpi.label}
          </div>
          <div className="font-mono text-[21px] font-semibold text-text-primary mt-1.5">
            {kpi.value}
          </div>
        </div>
      ))}
    </div>
  );
});
