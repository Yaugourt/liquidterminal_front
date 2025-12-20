"use client";

import { memo } from "react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { Loader2, BarChart3, Layers, Building2, TrendingUp, Activity, Wifi, WifiOff } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * Carte affichant les statistiques globales des PerpDexs (HIP-3) avec données live
 */
export const PerpDexStatsCard = memo(function PerpDexStatsCard() {
  const { globalStats, isLoading, error, wsConnected } = usePerpDexMarketData();
  const { format } = useNumberFormat();

  if (error) {
    return (
      <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 h-full">
        <div className="flex justify-center items-center h-full">
          <p className="text-rose-400 text-sm">Failed to load stats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-accent/10 flex items-center justify-center">
            <BarChart3 size={16} className="text-brand-accent" />
          </div>
          <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">HIP-3 Overview</h3>
        </div>
        <div className="flex items-center gap-2">
          {wsConnected ? (
            <Wifi className="h-3 w-3 text-emerald-400" />
          ) : (
            <WifiOff className="h-3 w-3 text-rose-400" />
          )}
          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-medium">
            LIVE
          </span>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm flex-1 content-center">
          {/* Total Dexs */}
          <div>
            <div className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center">
              <Building2 className="h-3 w-3 text-brand-accent mr-1.5" />
              Active DEXs
            </div>
            <div className="text-white font-bold text-lg">
              {globalStats?.totalDexs || 0}
            </div>
          </div>

          {/* Active Markets */}
          <div>
            <div className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center">
              <Layers className="h-3 w-3 text-brand-accent mr-1.5" />
              Active Markets
            </div>
            <div className="text-white font-bold text-lg">
              {globalStats?.activeMarkets || 0}
              <span className="text-text-muted text-xs font-normal ml-1">
                / {globalStats?.totalAssets || 0}
              </span>
            </div>
          </div>

          {/* 24h Volume */}
          <div>
            <div className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center">
              <Activity className="h-3 w-3 text-brand-accent mr-1.5" />
              24h Volume
            </div>
            <div className="text-white font-bold text-lg">
              {globalStats?.totalVolume24h ? formatNumber(globalStats.totalVolume24h, format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                currency: '$',
                showCurrency: true
              }) : '$0'}
            </div>
          </div>

          {/* Open Interest */}
          <div>
            <div className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center">
              <TrendingUp className="h-3 w-3 text-brand-accent mr-1.5" />
              Open Interest
            </div>
            <div className="text-white font-bold text-lg">
              {globalStats?.totalOpenInterest ? formatNumber(globalStats.totalOpenInterest, format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                currency: '$',
                showCurrency: true
              }) : '$0'}
            </div>
          </div>

          {/* Total OI Cap */}
          <div>
            <div className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center">
              <BarChart3 className="h-3 w-3 text-brand-accent mr-1.5" />
              Total OI Cap
            </div>
            <div className="text-white font-bold text-lg">
              {globalStats?.totalOiCap ? formatNumber(globalStats.totalOiCap, format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                currency: '$',
                showCurrency: true
              }) : '$0'}
            </div>
          </div>

          {/* Avg Funding */}
          <div>
            <div className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center">
              <Activity className="h-3 w-3 text-brand-accent mr-1.5" />
              Avg Funding
            </div>
            <div className={`font-bold text-lg ${(globalStats?.avgFunding || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {globalStats?.avgFunding 
                ? `${(globalStats.avgFunding * 100).toFixed(4)}%`
                : '0.0000%'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

