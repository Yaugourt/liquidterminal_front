"use client";

import { motion } from "framer-motion";
import type { BuilderDetailStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { StatsCard } from "@/components/common";

interface BuilderDetailStatsGridProps {
  stats: BuilderDetailStatsPayload | null;
  isLoading: boolean;
  error: Error | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
};

export function BuilderDetailStatsGrid({ stats, isLoading, error }: BuilderDetailStatsGridProps) {
  const { format } = useNumberFormat();

  if (error) {
    return <div className="bg-surface border border-rose-500/20 rounded-lg p-4 text-rose-400 text-sm">{error.message}</div>;
  }

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card animate-pulse h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

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
