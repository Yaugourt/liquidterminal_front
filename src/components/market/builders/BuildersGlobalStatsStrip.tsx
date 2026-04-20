"use client";

import { motion } from "framer-motion";
import { BarChart3, DollarSign, Users, Zap } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import { VariationBadge } from "./VariationBadge";
import type { BuildersGlobalStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface BuildersGlobalStatsStripProps {
  stats: BuildersGlobalStatsPayload | null;
  isLoading: boolean;
  error: Error | null;
}

export function BuildersGlobalStatsStrip({ stats, isLoading, error }: BuildersGlobalStatsStripProps) {
  const { format } = useNumberFormat();

  if (error) {
    return (
      <div className="glass-panel border border-rose-500/20 rounded-2xl p-4 text-center text-rose-400 text-sm">
        {error.message}
      </div>
    );
  }

  const items = [
    {
      label: "Volume",
      value: stats
        ? formatNumber(stats.current.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
        : "—",
      icon: <BarChart3 className="w-4 h-4 text-brand-accent" />,
      pct: stats?.variations?.totalVolumePct,
    },
    {
      label: "Builder fees",
      value: stats
        ? formatNumber(stats.current.totalBuilderFees, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
        : "—",
      icon: <DollarSign className="w-4 h-4 text-brand-gold" />,
      pct: stats?.variations?.totalBuilderFeesPct,
    },
    {
      label: "Unique users",
      value: stats
        ? formatNumber(stats.current.uniqueUsers, format, { maximumFractionDigits: 0 })
        : "—",
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      pct: stats?.variations?.uniqueUsersPct,
    },
    {
      label: "Fills",
      value: stats
        ? formatNumber(stats.current.fillCount, format, { maximumFractionDigits: 0 })
        : "—",
      icon: <Zap className="w-4 h-4 text-violet-400" />,
      pct: stats?.variations?.fillCountPct,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="flex flex-col gap-1"
        >
          <StatsCard
            title={item.label}
            value={item.value}
            icon={item.icon}
            isLoading={isLoading && !stats}
          />
          {item.pct !== undefined && item.pct !== null && (
            <div className="px-4">
              <VariationBadge pct={item.pct} />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
