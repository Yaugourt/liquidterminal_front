"use client";

import { formatNumber } from "@/lib/formatters/numberFormatting";
import { Zap, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useRecentLiquidations } from "@/services/explorer/liquidation";
import { useNumberFormat } from "@/store/number-format.store";
import { useMemo } from "react";

export function LiquidationsStatsCard() {
  const { liquidations, isLoading } = useRecentLiquidations({ limit: 500 });
  const { format } = useNumberFormat();

  // Calculate stats from recent liquidations
  const stats = useMemo(() => {
    if (!liquidations.length) {
      return {
        totalVolume: 0,
        count: 0,
        longCount: 0,
        shortCount: 0,
        topCoin: '-',
      };
    }

    const totalVolume = liquidations.reduce((sum, liq) => sum + liq.notional_total, 0);
    const longCount = liquidations.filter(liq => liq.liq_dir === 'Long').length;
    const shortCount = liquidations.filter(liq => liq.liq_dir === 'Short').length;

    // Find top coin by volume
    const coinVolumes: Record<string, number> = {};
    liquidations.forEach(liq => {
      coinVolumes[liq.coin] = (coinVolumes[liq.coin] || 0) + liq.notional_total;
    });
    const topCoin = Object.entries(coinVolumes).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    return {
      totalVolume,
      count: liquidations.length,
      longCount,
      shortCount,
      topCoin,
    };
  }, [liquidations]);

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
          <Zap size={16} className="text-rose-400" />
        </div>
        <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">
          Liquidation Stats (2h)
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 flex-1 content-center">
        {/* Total Volume */}
        <div>
          <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
            <DollarSign className="h-3.5 w-3.5 text-rose-400 mr-1.5" />
            Total Volume
          </div>
          <div className="text-white font-bold text-xl pl-5">
            {isLoading ? (
              <span className="animate-pulse text-text-muted">--</span>
            ) : (
              <>${formatNumber(stats.totalVolume, format, { maximumFractionDigits: 0 })}</>
            )}
          </div>
        </div>

        {/* Count */}
        <div>
          <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
            <Zap className="h-3.5 w-3.5 text-rose-400 mr-1.5" />
            Liquidations
          </div>
          <div className="text-white font-bold text-xl pl-5">
            {isLoading ? (
              <span className="animate-pulse text-text-muted">--</span>
            ) : (
              stats.count
            )}
          </div>
        </div>

        {/* Long vs Short */}
        <div>
          <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
            Long / Short
          </div>
          <div className="flex items-center gap-3 pl-5">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">
                {isLoading ? '--' : stats.longCount}
              </span>
            </div>
            <span className="text-text-muted">/</span>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-rose-400 font-bold">
                {isLoading ? '--' : stats.shortCount}
              </span>
            </div>
          </div>
        </div>

        {/* Top Coin */}
        <div>
          <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
            Top Coin
          </div>
          <div className="text-brand-accent font-bold text-xl pl-5">
            {isLoading ? (
              <span className="animate-pulse text-text-muted">--</span>
            ) : (
              stats.topCoin
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
