"use client";

import { useMemo } from "react";
import { Database, Activity, Lock, Percent, Sigma } from "lucide-react";
import { StatsCard } from "@/components/common";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useVaultSummaries } from "@/services/explorer/vault/hooks/useVaultSummaries";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";

export function VaultsKpiStrip() {
  const { vaults, totalTvl, isLoading: vaultsLoading } = useVaults({ limit: 1000 });
  const { summaries, isLoading: summariesLoading } = useVaultSummaries({
    includeClosed: true,
    limit: 5000,
  });

  const isLoading = vaultsLoading || summariesLoading;

  const stats = useMemo(() => {
    if (!vaults.length && !summaries.length) return null;

    const openCount = vaults.filter((v) => !v.summary.isClosed).length;
    const closedCount = vaults.filter((v) => v.summary.isClosed).length;

    const aprs = vaults.map((v) => v.apr).filter((n) => Number.isFinite(n));
    const highestApr = aprs.length ? Math.max(...aprs) : 0;
    const avgApr = aprs.length ? aprs.reduce((a, b) => a + b, 0) / aprs.length : 0;

    const totalFollowers = summaries.reduce((acc, s) => acc + (s.followerCount ?? 0), 0);

    return { totalTvl, openCount, closedCount, highestApr, avgApr, totalFollowers };
  }, [vaults, summaries, totalTvl]);

  const items = [
    {
      title: "Total TVL",
      value: stats ? `$${formatLargeNumber(stats.totalTvl, { decimals: 2 })}` : "—",
      icon: <Database className="w-4 h-4 text-brand" />,
    },
    {
      title: "Active",
      value: stats ? stats.openCount.toLocaleString() : "—",
      icon: <Activity className="w-4 h-4 text-success" />,
      iconClassName: "bg-success/10",
    },
    {
      title: "Closed",
      value: stats ? stats.closedCount.toLocaleString() : "—",
      icon: <Lock className="w-4 h-4 text-text-secondary" />,
      iconClassName: "bg-surface-2",
    },
    {
      title: "Avg APR",
      value: stats ? `${stats.avgApr.toFixed(2)}%` : "—",
      icon: <Percent className="w-4 h-4 text-gold" />,
      iconClassName: "bg-gold/10",
    },
    {
      title: "Followers",
      value: stats ? stats.totalFollowers.toLocaleString() : "—",
      icon: <Sigma className="w-4 h-4 text-brand" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
      {items.map((item) => (
        <StatsCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          iconClassName={item.iconClassName}
          isLoading={isLoading}
          density="compact"
        />
      ))}
    </div>
  );
}
