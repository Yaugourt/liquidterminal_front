"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, BarChart3, Coins } from "lucide-react";
import { VariationBadge } from "./VariationBadge";
import { StatsCard } from "@/components/common/StatsCard";
import type { BuilderDetailStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface BuilderIntelligenceKpisProps {
  stats: BuilderDetailStatsPayload | null;
  isLoading: boolean;
}

export function BuilderIntelligenceKpis({ stats, isLoading }: BuilderIntelligenceKpisProps) {
  const { format } = useNumberFormat();

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

  const c = stats.current;
  const avgFeesPerUser = c.uniqueUsers > 0 ? c.totalBuilderFees / c.uniqueUsers : 0;
  const avgVolumePerUser = c.uniqueUsers > 0 ? c.totalVolume / c.uniqueUsers : 0;

  const items = [
    {
      label: "Builder revenue",
      value: formatNumber(c.totalBuilderFees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true }),
      icon: <TrendingUp className="w-4 h-4 text-brand-gold" />,
      pct: stats.variations?.totalBuilderFeesPct,
      valueClassName: "text-lg font-bold tabular-nums text-brand-gold",
    },
    {
      label: "Active users",
      value: formatNumber(c.uniqueUsers, format, { maximumFractionDigits: 0 }),
      icon: <Users className="w-4 h-4 text-brand-accent" />,
      pct: stats.variations?.uniqueUsersPct,
      valueClassName: "text-lg font-bold tabular-nums text-brand-accent",
    },
    {
      label: "Avg rev / user",
      value: formatNumber(avgFeesPerUser, format, { maximumFractionDigits: 4, currency: "$", showCurrency: true }),
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
      pct: null,
      valueClassName: "text-lg font-bold tabular-nums text-emerald-400",
    },
    {
      label: "Avg volume / user",
      value: formatNumber(avgVolumePerUser, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true }),
      icon: <Coins className="w-4 h-4 text-text-secondary" />,
      pct: null,
      valueClassName: "text-lg font-bold tabular-nums text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <StatsCard
            title={item.label}
            value={item.value}
            icon={item.icon}
            valueClassName={item.valueClassName}
          />
          {item.pct !== null && item.pct !== undefined && (
            <div className="mt-1 px-4">
              <VariationBadge pct={item.pct} />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
