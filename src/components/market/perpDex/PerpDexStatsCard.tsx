"use client";

import { memo } from "react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { BarChart3, Layers, Building2, TrendingUp, Activity, Wifi, WifiOff } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";
import { StatsPanel } from "@/components/common";

interface InlineStatProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

function InlineStat({ icon, label, value, valueClassName }: InlineStatProps) {
  return (
    <div>
      <div className="text-stat-label mb-1 flex items-center">
        <span className="mr-1.5">{icon}</span>
        {label}
      </div>
      <div className={valueClassName ?? "text-text-primary font-bold text-lg"}>{value}</div>
    </div>
  );
}

const usdFormat = { minimumFractionDigits: 0, maximumFractionDigits: 0, currency: '$', showCurrency: true } as const;

export const PerpDexStatsCard = memo(function PerpDexStatsCard() {
  const { globalStats, isLoading, error, wsConnected } = usePerpDexMarketData();
  const { format } = useNumberFormat();
  const avgFunding = globalStats?.avgFunding ?? 0;

  return (
    <StatsPanel
      title="HIP-3 Overview"
      icon={<BarChart3 size={16} className="text-brand" />}
      isLoading={isLoading}
      error={error}
      errorTitle="Failed to load stats"
      headerAction={
        <div className="flex items-center gap-2">
          {wsConnected ? (
            <Wifi className="h-3 w-3 text-emerald-400" />
          ) : (
            <WifiOff className="h-3 w-3 text-rose-400" />
          )}
          <span className="text-label px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">
            LIVE
          </span>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm content-center h-full">
        <InlineStat
          icon={<Building2 className="h-3 w-3 text-brand" />}
          label="Active DEXs"
          value={globalStats?.totalDexs || 0}
        />
        <InlineStat
          icon={<Layers className="h-3 w-3 text-brand" />}
          label="Active Markets"
          value={
            <>
              {globalStats?.activeMarkets || 0}
              <span className="text-text-tertiary text-xs font-normal ml-1">
                / {globalStats?.totalAssets || 0}
              </span>
            </>
          }
        />
        <InlineStat
          icon={<Activity className="h-3 w-3 text-brand" />}
          label="24h Volume"
          value={globalStats?.totalVolume24h ? formatNumber(globalStats.totalVolume24h, format, usdFormat) : "$0"}
        />
        <InlineStat
          icon={<TrendingUp className="h-3 w-3 text-brand" />}
          label="Open Interest"
          value={globalStats?.totalOpenInterest ? formatNumber(globalStats.totalOpenInterest, format, usdFormat) : "$0"}
        />
        <InlineStat
          icon={<BarChart3 className="h-3 w-3 text-brand" />}
          label="Total OI Cap"
          value={globalStats?.totalOiCap ? formatNumber(globalStats.totalOiCap, format, usdFormat) : "$0"}
        />
        <InlineStat
          icon={<Activity className="h-3 w-3 text-brand" />}
          label="Avg Funding"
          value={globalStats?.avgFunding ? `${(globalStats.avgFunding * 100).toFixed(4)}%` : "0.0000%"}
          valueClassName={`font-bold text-lg ${avgFunding >= 0 ? "text-emerald-400" : "text-rose-400"}`}
        />
      </div>
    </StatsPanel>
  );
});
