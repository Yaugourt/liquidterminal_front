"use client";

import { KpiRibbon, type KpiCell } from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import type { UseVaultsDirectoryResult } from "@/services/explorer/vault/hooks/useVaultsDirectory";

interface VaultsKpiStripProps {
  directory: UseVaultsDirectoryResult;
}

/**
 * KPI ribbon for the Vaults page (§7.b via <KpiRibbon>).
 *
 * Only metrics with a real source are shown. HyperLiquid's vault feed exposes
 * no closed vaults, no global depositor count and no net-flow history, so those
 * are deliberately omitted rather than faked (DS "no fake data" rule). Follower
 * counts come from the HypeDexer top-tracked set — labelled accordingly.
 */
export function VaultsKpiStrip({ directory }: VaultsKpiStripProps) {
  const { totalTvl, totalCount, avgApr, totalFollowers, isLoading } = directory;
  const ph = isLoading ? "…" : "—";

  const cells: KpiCell[] = [
    {
      label: "Total TVL",
      value: isLoading && !totalTvl ? ph : compactUsd(totalTvl),
      sub: "across tracked vaults",
    },
    {
      label: "Vaults",
      value: isLoading && !totalCount ? ph : compactCount(totalCount),
      sub: "total tracked",
    },
    {
      label: "Avg APR · median",
      value: isLoading && !avgApr ? ph : `${avgApr >= 0 ? "+" : ""}${avgApr.toFixed(1)}%`,
      tone: avgApr >= 0 ? "success" : "danger",
      sub: "active · excl HLP",
    },
    {
      label: "Followers · tracked",
      value: isLoading && !totalFollowers ? ph : compactCount(totalFollowers),
      sub: "Σ followerCount",
    },
  ];

  // Boxed variant (default) so the Overview cells carry the same bg-surface
  // fill as the dashboard's Network Pulse ribbon (PulseBar) — visual parity.
  return <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-4" />;
}
