"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { useNumberFormat } from "@/store/number-format.store";

const usdFormat = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  currency: "$",
  showCurrency: true,
} as const;

interface StatItem {
  label: string;
  value: string;
  change?: number | null;
}

function DeltaPill({ change }: { change: number | null | undefined }) {
  if (change === undefined || change === null || !Number.isFinite(change))
    return null;
  const rounded = Number(change.toFixed(1));
  const positive = rounded >= 0;
  return (
    <span
      className={`mono text-[11px] font-medium ${positive ? "text-success" : "text-danger"}`}
    >
      {positive ? "+" : ""}
      {rounded}%
    </span>
  );
}

export const PerpDexStatsCard = memo(function PerpDexStatsCard() {
  const { globalStats, isLoading } = usePerpDexMarketData();
  const { format } = useNumberFormat();

  const avgFunding = globalStats?.avgFunding ?? 0;

  const items: StatItem[] = [
    {
      label: "Active DEXs",
      value: globalStats ? String(globalStats.totalDexs) : "—",
    },
    {
      label: "Active Markets",
      value: globalStats
        ? `${globalStats.activeMarkets} / ${globalStats.totalAssets}`
        : "—",
    },
    {
      label: "24h Volume",
      value: globalStats?.totalVolume24h
        ? formatNumber(globalStats.totalVolume24h, format, usdFormat)
        : "—",
    },
    {
      label: "Open Interest",
      value: globalStats?.totalOpenInterest
        ? formatNumber(globalStats.totalOpenInterest, format, usdFormat)
        : "—",
    },
    {
      label: "Total OI Cap",
      value: globalStats?.totalOiCap
        ? formatNumber(globalStats.totalOiCap, format, usdFormat)
        : "—",
    },
    {
      label: "Avg Funding",
      value: globalStats?.avgFunding
        ? `${(globalStats.avgFunding * 100).toFixed(4)}%`
        : "0.0000%",
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-6 gap-2">
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
            {item.change !== undefined && <DeltaPill change={item.change} />}
          </div>
          <div
            className={`mono text-[18px] leading-tight font-semibold ${
              item.label === "Avg Funding"
                ? avgFunding >= 0
                  ? "text-success"
                  : "text-danger"
                : "text-text-primary"
            }`}
          >
            {isLoading && !globalStats ? (
              <span className="text-text-tertiary">…</span>
            ) : (
              item.value
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
});
