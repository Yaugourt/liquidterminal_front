"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { BuilderCoinBreakdownRow } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

interface BuilderCoinBreakdownProps {
  coins: BuilderCoinBreakdownRow[];
  isLoading: boolean;
  label?: string;
}

export function BuilderCoinBreakdown({ coins, isLoading, label }: BuilderCoinBreakdownProps) {
  const { format } = useNumberFormat();

  const sorted = useMemo(
    () =>
      [...coins]
        .sort((a, b) => ((b.totalVolume as number) ?? 0) - ((a.totalVolume as number) ?? 0))
        .slice(0, 10),
    [coins]
  );

  const maxVolume = useMemo(
    () => Math.max(...sorted.map((c) => (c.totalVolume as number) ?? 0), 1),
    [sorted]
  );

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">{label ?? "Top Coins"}</h2>
        <span className="text-text-muted text-xs">{sorted.length} coins</span>
      </div>

      {isLoading && sorted.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-brand-accent" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-8">No data for this window.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((coin, i) => {
            const vol = (coin.totalVolume as number) ?? 0;
            const fees = (coin.totalBuilderFees as number) ?? 0;
            const pct = (vol / maxVolume) * 100;
            return (
              <motion.div
                key={(coin.coin as string) ?? i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs w-4 tabular-nums">{i + 1}</span>
                    <span className="text-white text-sm font-medium">{(coin.coin as string) ?? "—"}</span>
                    {coin.uniqueUsers !== undefined && (
                      <span className="text-text-muted text-xs">{coin.uniqueUsers as number} users</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm tabular-nums">
                      {formatNumber(vol, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                    </p>
                    {fees > 0 && (
                      <p className="text-brand-gold text-xs tabular-nums">
                        {formatNumber(fees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.04 + 0.1, duration: 0.4 }}
                    className="h-full bg-brand-accent/50 rounded-full"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
