"use client";

import { formatNumber } from "@/lib/formatters/numberFormatting";
import { Zap, TrendingUp, TrendingDown, DollarSign, BarChart3, Target } from "lucide-react";
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

  // Calculer le pourcentage Long/Short pour la barre de progression
  const totalVolume = stats.longVolume + stats.shortVolume;
  const longPercent = totalVolume > 0 ? (stats.longVolume / totalVolume) * 100 : 50;
  const shortPercent = 100 - longPercent;

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
                  : 'tab-inactive'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid - 2x2 on XL screens, 1 column on smaller */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-4 flex-1 content-center">
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

        {/* Long vs Short Count */}
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

        {/* Avg Size - Hidden on small screens */}
        <div className="hidden xl:block">
          <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
            <BarChart3 className="h-3.5 w-3.5 text-amber-400 mr-1.5" />
            Avg Size
          </div>
          <div className="text-white font-bold text-lg pl-5">
            {statsLoading ? (
              <span className="animate-pulse text-text-muted">--</span>
            ) : (
              <>${formatNumber(stats.avgSize, format, { maximumFractionDigits: 0 })}</>
            )}
          </div>
        </div>

        {/* Max Liquidation - Hidden on small screens */}
        <div className="hidden xl:block">
          <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
            <Target className="h-3.5 w-3.5 text-purple-400 mr-1.5" />
            Max Liq
          </div>
          <div className="text-white font-bold text-lg pl-5">
            {statsLoading ? (
              <span className="animate-pulse text-text-muted">--</span>
            ) : (
              <>${formatNumber(stats.maxLiq, format, { maximumFractionDigits: 0 })}</>
            )}
          </div>
        </div>

        {/* Long/Short Volume Ratio - Hidden on small screens, spans 2 cols */}
        <div className="hidden xl:block xl:col-span-2">
          <div className="text-text-secondary mb-2 flex items-center text-xs font-medium">
            Volume Ratio
          </div>
          <div className="flex items-center gap-2">
            {/* Progress bar showing Long vs Short volume */}
            <div className="flex-1 h-2 bg-gradient-to-r from-rose-500 to-rose-400 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${longPercent}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-medium">
                {statsLoading ? '--' : `${longPercent.toFixed(0)}%`}
              </span>
              <span className="text-text-muted">/</span>
              <span className="text-rose-400 font-medium">
                {statsLoading ? '--' : `${shortPercent.toFixed(0)}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

