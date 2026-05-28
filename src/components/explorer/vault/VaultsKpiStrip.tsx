"use client";

import { useMemo } from "react";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useVaultSummaries } from "@/services/explorer/vault/hooks/useVaultSummaries";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";

interface KpiCell {
  label: string;
  value: string;
}

/**
 * KPI ribbon for the Vaults page — canonical V4 strip (§7.b of DESIGN_SYSTEM):
 * continuous bar of value-only cells separated by hair-line dividers,
 * matching the dashboard PulseBar.
 */
export function VaultsKpiStrip() {
  const { vaults, totalTvl, isLoading: vaultsLoading } = useVaults({ limit: 1000 });
  const { summaries, isLoading: summariesLoading } = useVaultSummaries({
    includeClosed: true,
    limit: 5000,
  });

  const isLoading = vaultsLoading || summariesLoading;
  const loadingPlaceholder = "…";

  const stats = useMemo(() => {
    if (!vaults.length && !summaries.length) return null;
    const openCount = vaults.filter((v) => !v.summary.isClosed).length;
    const closedCount = vaults.filter((v) => v.summary.isClosed).length;
    const aprs = vaults.map((v) => v.apr).filter((n) => Number.isFinite(n));
    const avgApr = aprs.length ? aprs.reduce((a, b) => a + b, 0) / aprs.length : 0;
    const totalFollowers = summaries.reduce((acc, s) => acc + (s.followerCount ?? 0), 0);
    return { totalTvl, openCount, closedCount, avgApr, totalFollowers };
  }, [vaults, summaries, totalTvl]);

  const kpis: KpiCell[] = [
    {
      label: "Total TVL",
      value: isLoading && !stats ? loadingPlaceholder : compactUsd(stats?.totalTvl),
    },
    {
      label: "Active",
      value: isLoading && !stats ? loadingPlaceholder : compactCount(stats?.openCount),
    },
    {
      label: "Closed",
      value: isLoading && !stats ? loadingPlaceholder : compactCount(stats?.closedCount),
    },
    {
      label: "Avg APR",
      value: isLoading && !stats ? loadingPlaceholder : stats ? `${stats.avgApr.toFixed(1)}%` : "—",
    },
    {
      label: "Followers",
      value:
        isLoading && !stats ? loadingPlaceholder : compactCount(stats?.totalFollowers),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-px bg-border-subtle border border-border-default rounded-lg overflow-hidden">
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
        </div>
      ))}
    </div>
  );
}
