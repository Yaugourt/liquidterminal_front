"use client";

import { formatNumber } from "@/lib/formatters/numberFormatting";
import { Zap, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";
import { useLiquidationsContext, TIMEFRAME_OPTIONS } from "./LiquidationsContext";

export function LiquidationsStatsCard() {
  const { 
    selectedPeriod, 
    setSelectedPeriod, 
    stats, 
    statsLoading 
  } = useLiquidationsContext();
  
  const { format } = useNumberFormat();

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header with period selector */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <Zap size={16} className="text-rose-400" />
          </div>
          <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">
            Liquidation Stats
          </h3>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-brand-dark rounded-lg p-0.5 border border-border-subtle">
          {TIMEFRAME_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`flex-1 px-2 py-1 rounded-md text-label transition-all ${
                selectedPeriod === option.value
                  ? 'bg-rose-500/20 text-rose-400 font-bold'
                  : 'text-text-secondary hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 flex-1 content-center">
        {/* Total Volume */}
        <div>
          <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
            <DollarSign className="h-3.5 w-3.5 text-rose-400 mr-1.5" />
            Total Volume
          </div>
          <div className="text-white font-bold text-lg pl-5">
            {statsLoading ? (
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
          <div className="text-white font-bold text-lg pl-5">
            {statsLoading ? (
              <span className="animate-pulse text-text-muted">--</span>
            ) : (
              stats.liquidationsCount
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
              <span className="text-emerald-400 font-bold text-sm">
                {statsLoading ? '--' : stats.longCount}
              </span>
            </div>
            <span className="text-text-muted">/</span>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-rose-400 font-bold text-sm">
                {statsLoading ? '--' : stats.shortCount}
              </span>
            </div>
          </div>
        </div>

        {/* Top Coin */}
        <div>
          <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
            Top Coin
          </div>
          <div className="text-brand-accent font-bold text-lg pl-5">
            {statsLoading ? (
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
