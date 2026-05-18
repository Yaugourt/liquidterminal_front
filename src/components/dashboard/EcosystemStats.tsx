"use client";

import { memo } from "react";
import { BarChart3, Layers, Receipt, Vault, Shield, Users } from "lucide-react";
import { StatsCard } from "@/components/common";
import { Liquidations24hCard } from "./Liquidations24hCard";
import { useDashboardStats } from "@/services/dashboard";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * EcosystemStats — bandeau de KPI du Dashboard, une carte par stat.
 * 6 StatsCard + la carte Liquidations 24h (résumé visuel avec ratio L/S).
 */
export const EcosystemStats = memo(function EcosystemStats() {
  const { stats: dash, isLoading } = useDashboardStats();
  const { stats: perp } = usePerpGlobalStats();
  const { feesStats } = useFeesStats();
  const { format } = useNumberFormat();

  const count = (n: number | undefined | null) =>
    n == null ? "—" : formatNumber(n, format, { maximumFractionDigits: 0 });

  const cards = [
    {
      title: "24h Volume",
      value: compactUsd(dash?.dailyVolume),
      icon: <BarChart3 size={16} className="text-brand" />,
    },
    {
      title: "Open Interest",
      value: compactUsd(perp?.totalOpenInterest),
      icon: <Layers size={16} className="text-brand" />,
    },
    {
      title: "24h Fees",
      value: compactUsd(feesStats?.dailyFees),
      icon: <Receipt size={16} className="text-brand" />,
      subValue:
        feesStats?.dailySpotFees != null ? (
          <span className="mono text-text-tertiary">
            Spot {compactUsd(feesStats.dailySpotFees)}
          </span>
        ) : undefined,
    },
    {
      title: "Vaults TVL",
      value: compactUsd(dash?.vaultsTvl),
      icon: <Vault size={16} className="text-brand" />,
    },
    {
      title: "HYPE Staked",
      value: count(dash?.totalHypeStake),
      icon: <Shield size={16} className="text-brand" />,
    },
    {
      title: "Users",
      value: count(dash?.numberOfUsers),
      icon: <Users size={16} className="text-brand" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-stretch">
      {cards.map((c) => (
        <StatsCard
          key={c.title}
          title={c.title}
          value={c.value}
          icon={c.icon}
          subValue={c.subValue}
          isLoading={isLoading}
          className="h-full"
        />
      ))}
      <div className="col-span-2">
        <Liquidations24hCard className="h-full" />
      </div>
    </div>
  );
});
