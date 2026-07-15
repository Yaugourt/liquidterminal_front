"use client";

import { motion } from "framer-motion";
import type { BuilderDetailStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { StatsCard, Skeleton } from "@/components/common";
import { ErrorState } from "@/components/ui/error-state";
import { isBuilderWindowEmpty } from "./builderStatsWindow";

interface BuilderDetailStatsGridProps {
  stats: BuilderDetailStatsPayload | null;
  isLoading: boolean;
  error: Error | null;
  /** Refetch handler surfaced as a Retry button in the error state. */
  onRetry?: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
};

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

  const items = [
    {
      label: "Volume",
      value: formatNumber(current.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true }),
      pct: variations?.totalVolumePct,
    },
    {
      label: "Builder fees",
      value: formatNumber(current.totalBuilderFees, format, { maximumFractionDigits: 4, currency: "$", showCurrency: true }),
      pct: variations?.totalBuilderFeesPct,
    },
    {
      label: "Fills",
      value: formatNumber(current.fillCount, format, { maximumFractionDigits: 0 }),
      pct: variations?.fillCountPct,
    },
    {
      label: "Unique users",
      value: formatNumber(current.uniqueUsers, format, { maximumFractionDigits: 0 }),
      pct: variations?.uniqueUsersPct,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <StatsCard
            title={item.label}
            value={item.value}
            change={typeof item.pct === "number" && Number.isFinite(item.pct) ? item.pct : undefined}
            density="compact"
            withCard={false}
            className="stat-card"
            valueClassName="text-text-primary text-lg font-semibold tabular-nums"
          />
        </motion.div>
      ))}
    </div>
  );
}
