"use client";

import type { BuilderDetailStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface BuilderDetailStatsGridProps {
  stats: BuilderDetailStatsPayload | null;
  isLoading: boolean;
  error: Error | null;
}

export function BuilderDetailStatsGrid({ stats, isLoading, error }: BuilderDetailStatsGridProps) {
  const { format } = useNumberFormat();

  if (error) {
    return (
      <div className="glass-panel border border-rose-500/20 rounded-2xl p-4 text-rose-400 text-sm">{error.message}</div>
    );
  }

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card animate-pulse h-24 bg-brand-secondary/40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const c = stats.current;

  const items: { label: string; value: string }[] = [
    {
      label: "Volume",
      value: formatNumber(c.totalVolume, format, {
        maximumFractionDigits: 0,
        currency: "$",
        showCurrency: true,
      }),
    },
    {
      label: "Builder fees",
      value: formatNumber(c.totalBuilderFees, format, {
        maximumFractionDigits: 4,
        currency: "$",
        showCurrency: true,
      }),
    },
    {
      label: "Fills",
      value: formatNumber(c.fillCount, format, { maximumFractionDigits: 0 }),
    },
    {
      label: "Unique users",
      value: formatNumber(c.uniqueUsers, format, { maximumFractionDigits: 0 }),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="stat-card">
          <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
          <p className="text-white text-lg font-semibold tabular-nums mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
