"use client";

import { motion } from "framer-motion";
import type { BuilderDetailStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { TrendingUp, TrendingDown } from "lucide-react";

interface BuilderDetailStatsGridProps {
  stats: BuilderDetailStatsPayload | null;
  isLoading: boolean;
  error: Error | null;
}

function VariationBadge({ pct }: { pct?: number | null }) {
  if (pct === undefined || pct === null || !Number.isFinite(pct)) return null;
  const positive = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${positive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
      {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {positive ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
};

export function BuilderDetailStatsGrid({ stats, isLoading, error }: BuilderDetailStatsGridProps) {
  const { format } = useNumberFormat();

  if (error) {
    return <div className="glass-panel border border-rose-500/20 p-4 text-rose-400 text-sm">{error.message}</div>;
  }

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card animate-pulse h-24 rounded-xl" />
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
          className="stat-card flex flex-col gap-1.5 p-3 lg:p-4"
        >
          <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-white text-lg font-semibold tabular-nums">{item.value}</p>
            <VariationBadge pct={item.pct} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
