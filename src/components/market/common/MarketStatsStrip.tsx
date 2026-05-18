"use client";

import { motion } from "framer-motion";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface MarketStatsStripProps {
  market: "spot" | "perp";
}

interface KpiItem {
  label: string;
  value: string;
  change?: number | null;
}

const usdFormat = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
  currency: "$",
  showCurrency: true,
} as const;

function DeltaPill({ change }: { change: number | null | undefined }) {
  if (change === undefined || change === null || !Number.isFinite(change)) return null;
  const rounded = Number(change.toFixed(1));
  const positive = rounded >= 0;
  return (
    <span
      className={`mono text-[11px] font-medium ${
        positive ? "text-success" : "text-danger"
      }`}
    >
      {positive ? "+" : ""}
      {rounded}%
    </span>
  );
}

export function MarketStatsStrip({ market }: MarketStatsStripProps) {
  const { stats: spotStats, isLoading: spotLoading, error: spotError } = useSpotGlobalStats();
  const { stats: perpStats, isLoading: perpLoading, error: perpError } = usePerpGlobalStats();
  const { feesStats, isLoading: feesLoading } = useFeesStats();
  const { format } = useNumberFormat();

  const isLoading = (market === "spot" ? spotLoading : perpLoading) || feesLoading;
  const error = market === "spot" ? spotError : perpError;

  if (error) {
    return (
      <div className="bg-surface border border-danger/30 rounded-lg p-3 text-center text-danger text-sm">
        {error.message}
      </div>
    );
  }

  const items: KpiItem[] =
    market === "spot"
      ? [
          {
            label: "24h Volume",
            value: spotStats
              ? formatNumber(spotStats.totalVolume24h, format, usdFormat)
              : "—",
          },
          {
            label: "Market Cap",
            value: spotStats
              ? formatNumber(spotStats.totalMarketCap, format, usdFormat)
              : "—",
          },
          {
            label: "Daily Fees",
            value: feesStats
              ? formatNumber(feesStats.dailySpotFees, format, usdFormat)
              : "—",
          },
          {
            label: "Tokens",
            value: spotStats
              ? formatNumber(spotStats.totalPairs, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : "—",
          },
        ]
      : [
          {
            label: "24h Volume",
            value: perpStats
              ? formatNumber(perpStats.totalVolume24h, format, usdFormat)
              : "—",
          },
          {
            label: "Open Interest",
            value: perpStats
              ? formatNumber(perpStats.totalOpenInterest, format, usdFormat)
              : "—",
          },
          {
            label: "Daily Fees",
            value: feesStats
              ? formatNumber(feesStats.dailyFees, format, usdFormat)
              : "—",
          },
          {
            label: "24h Trades",
            value: perpStats
              ? formatNumber(perpStats.totalTrades24h, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : "—",
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
            {item.change !== undefined && <DeltaPill change={item.change} />}
          </div>
          <div className="mono text-[20px] leading-tight font-semibold text-text-primary">
            {isLoading ? (
              <span className="text-text-tertiary">…</span>
            ) : (
              item.value
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
