"use client";

import type { BuilderDetailStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { KpiRibbon, Skeleton } from "@/components/common";
import type { KpiCell } from "@/components/common";
import { ErrorState } from "@/components/ui/error-state";
import { isBuilderWindowEmpty } from "./builderStatsWindow";

interface BuilderDetailStatsGridProps {
  stats: BuilderDetailStatsPayload | null;
  isLoading: boolean;
  error: Error | null;
  /** Refetch handler surfaced as a Retry button in the error state. */
  onRetry?: () => void;
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

export function BuilderDetailStatsGrid({ stats, isLoading, error, onRetry }: BuilderDetailStatsGridProps) {
  const { format } = useNumberFormat();

  if (error) {
    // Clean error state, never the raw error payload (Zod dumps JSON in `message`).
    return (
      <ErrorState
        title="Failed to load builder stats"
        message="The indexer did not return usable data for this builder."
        onRetry={onRetry}
        className="h-auto py-6"
      />
    );
  }

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

  const { current, variations } = stats;

  const cells: KpiCell[] = [
    {
      key: "Volume",
      label: "Volume",
      value: formatNumber(current.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true }),
      sub: deltaSub(variations?.totalVolumePct),
    },
    {
      key: "Builder fees",
      label: "Builder fees",
      value: formatNumber(current.totalBuilderFees, format, { maximumFractionDigits: 4, currency: "$", showCurrency: true }),
      sub: deltaSub(variations?.totalBuilderFeesPct),
      tone: "gold",
    },
    {
      key: "Fills",
      label: "Fills",
      value: formatNumber(current.fillCount, format, { maximumFractionDigits: 0 }),
      sub: deltaSub(variations?.fillCountPct),
    },
    {
      key: "Unique users",
      label: "Unique users",
      value: formatNumber(current.uniqueUsers, format, { maximumFractionDigits: 0 }),
      sub: deltaSub(variations?.uniqueUsersPct),
    },
  ];

  return <KpiRibbon cells={cells} />;
}
