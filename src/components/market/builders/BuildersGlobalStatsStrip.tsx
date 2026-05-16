"use client";

import { motion } from "framer-motion";
import type { BuildersGlobalStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface BuildersGlobalStatsStripProps {
  stats: BuildersGlobalStatsPayload | null;
  isLoading: boolean;
  error: Error | null;
}

interface StatItem {
  label: string;
  value: string;
  change: number | null | undefined;
}

export function BuildersGlobalStatsStrip({ stats, isLoading, error }: BuildersGlobalStatsStripProps) {
  const { format } = useNumberFormat();

  if (error) {
    return (
      <div className="bg-surface border border-danger/30 rounded-lg p-3 text-center text-danger text-sm">
        {error.message}
      </div>
    );
  }

  const items: StatItem[] = [
    {
      label: "Volume",
      value: stats
        ? formatNumber(stats.current.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
        : "—",
      change: stats?.variations?.totalVolumePct,
    },
    {
      label: "Builder Fees",
      value: stats
        ? formatNumber(stats.current.totalBuilderFees, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
        : "—",
      change: stats?.variations?.totalBuilderFeesPct,
    },
    {
      label: "Unique Users",
      value: stats
        ? formatNumber(stats.current.uniqueUsers, format, { maximumFractionDigits: 0 })
        : "—",
      change: stats?.variations?.uniqueUsersPct,
    },
    {
      label: "Fills",
      value: stats
        ? formatNumber(stats.current.fillCount, format, { maximumFractionDigits: 0 })
        : "—",
      change: stats?.variations?.fillCountPct,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="bg-surface border border-border-subtle rounded-lg px-3.5 py-3"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
              {item.label}
            </span>
            <DeltaPill change={item.change} />
          </div>
          <div className="mono text-[20px] leading-tight font-semibold text-text-primary">
            {isLoading && !stats ? <span className="text-text-tertiary">…</span> : item.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function DeltaPill({ change }: { change: number | null | undefined }) {
  if (change === undefined || change === null || !Number.isFinite(change)) return null;
  const rounded = Number(change.toFixed(1));
  const positive = rounded >= 0;
  return (
    <span className={`mono text-[11px] font-medium ${positive ? "text-success" : "text-danger"}`}>
      {positive ? "+" : ""}
      {rounded}%
    </span>
  );
}
