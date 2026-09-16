"use client";

import { KpiRibbon, type KpiCell } from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import type { UseYieldsDirectoryResult } from "@/services/market/yields";

interface YieldsKpiStripProps {
  directory: UseYieldsDirectoryResult;
}

/**
 * KPI ribbon for the Yields page (§7.b via <KpiRibbon>). Figures come from
 * Hyperfolio's `metadata.totals` for the *current filter set*, so they follow
 * the toolbar. Lending markets report no TVL upstream, which is why a
 * lending-only filter shows "—" rather than a fabricated total.
 */
export function YieldsKpiStrip({ directory }: YieldsKpiStripProps) {
  const { totals, protocolFacets, categoryFacets, isLoading } = directory;
  const ph = isLoading ? "…" : "—";
  const activeProtocols = protocolFacets.length;
  const activeCategories = categoryFacets.filter((c) => c.count > 0).length;

  const cells: KpiCell[] = [
    {
      label: "Opportunities",
      value: isLoading && !totals.count ? ph : compactCount(totals.count),
      sub: "matching filters",
    },
    {
      label: "Total TVL",
      value: isLoading && !totals.tvl ? ph : totals.tvl > 0 ? compactUsd(totals.tvl) : "—",
      sub: "pools with reported depth",
    },
    {
      label: "TVL-weighted APY",
      value: isLoading && !totals.weightedApy ? ph : totals.tvl > 0 ? `${totals.weightedApy.toFixed(2)}%` : "—",
      tone: totals.weightedApy > 0 ? "success" : "default",
      sub: "across matching pools",
    },
    {
      label: "Protocols",
      value: isLoading && !activeProtocols ? ph : compactCount(activeProtocols),
      sub: `${activeCategories} categories`,
    },
  ];

  return <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-4" />;
}
