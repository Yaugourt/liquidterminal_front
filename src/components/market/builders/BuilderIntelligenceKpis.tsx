"use client";

import { KpiRibbon, Skeleton } from "@/components/common";
import type { KpiCell } from "@/components/common";
import type { BuilderDetailStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { isBuilderWindowEmpty } from "./builderStatsWindow";

interface BuilderIntelligenceKpisProps {
  stats: BuilderDetailStatsPayload | null;
  isLoading: boolean;
}

function deltaSub(change: number | null | undefined) {
  if (change === undefined || change === null || !Number.isFinite(change)) return undefined;
  const rounded = Number(change.toFixed(1));
  const positive = rounded >= 0;
  return (
    <span className={`mono text-[11px] font-medium ${positive ? "text-success" : "text-danger"}`}>
      {positive ? "+" : ""}
      {rounded}%
    </span>
  );
}

export function BuilderIntelligenceKpis({ stats, isLoading }: BuilderIntelligenceKpisProps) {
  const { format } = useNumberFormat();

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  // Empty window (common on 1h/24h upstream): an honest empty state beats $0.
  if (isBuilderWindowEmpty(stats)) {
    return (
      <div className="bg-surface border border-border-subtle rounded-lg p-6 text-center">
        <p className="text-text-secondary text-sm font-medium">No data for this window</p>
        <p className="text-text-tertiary text-xs mt-1">
          The indexer has no recorded activity for {stats.timeframe}. Try a wider window (7d / 30d).
        </p>
      </div>
    );
  }

  const c = stats.current;
  const avgFeesPerUser = c.uniqueUsers > 0 ? c.totalBuilderFees / c.uniqueUsers : 0;
  const avgVolumePerUser = c.uniqueUsers > 0 ? c.totalVolume / c.uniqueUsers : 0;

  const cells: KpiCell[] = [
    {
      key: "Builder revenue",
      label: "Builder revenue",
      value: formatNumber(c.totalBuilderFees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true }),
      sub: deltaSub(stats.variations?.totalBuilderFeesPct),
      tone: "gold",
    },
    {
      key: "Active users",
      label: "Active users",
      value: formatNumber(c.uniqueUsers, format, { maximumFractionDigits: 0 }),
      sub: deltaSub(stats.variations?.uniqueUsersPct),
    },
    {
      key: "Avg rev / user",
      label: "Avg rev / user",
      value: formatNumber(avgFeesPerUser, format, { maximumFractionDigits: 4, currency: "$", showCurrency: true }),
    },
    {
      key: "Avg volume / user",
      label: "Avg volume / user",
      value: formatNumber(avgVolumePerUser, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true }),
    },
  ];

  return <KpiRibbon cells={cells} />;
}
