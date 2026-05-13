"use client";

import { formatNumber } from "@/lib/formatters/numberFormatting";
import { Zap, TrendingUp, TrendingDown, DollarSign, BarChart3, Target } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";
import { useLiquidationsContext, TIMEFRAME_OPTIONS } from "./LiquidationsContext";
import { StatsPanel } from "@/components/common";
import { cn } from "@/lib/utils";


interface InlineStatProps {
  icon?: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
  valueClassName?: string;
  isLoading?: boolean;
  className?: string;
}

function InlineStat({ icon, label, value, valueClassName, isLoading, className }: InlineStatProps) {
  return (
    <div className={className}>
      <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
        {icon && <span className="mr-1.5">{icon}</span>}
        {label}
      </div>
      <div className={cn("font-bold text-lg pl-5", valueClassName ?? "text-white")}>
        {isLoading ? <span className="animate-pulse text-text-muted">--</span> : value}
      </div>
    </div>
  );
}

interface LongShortRatioBarProps {
  longPercent: number;
  shortPercent: number;
  isLoading: boolean;
}

function LongShortRatioBar({ longPercent, shortPercent, isLoading }: LongShortRatioBarProps) {
  return (
    <div className="hidden xl:block xl:col-span-2">
      <div className="text-text-secondary mb-2 flex items-center text-xs font-medium">
        Volume Ratio
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gradient-to-r from-rose-500 to-rose-400 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${longPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-400 font-medium">
            {isLoading ? '--' : `${longPercent.toFixed(0)}%`}
          </span>
          <span className="text-text-muted">/</span>
          <span className="text-rose-400 font-medium">
            {isLoading ? '--' : `${shortPercent.toFixed(0)}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

export function LiquidationsStatsCard() {
  const {
    selectedPeriod,
    setSelectedPeriod,
    stats,
    statsLoading,
  } = useLiquidationsContext();

  const { format } = useNumberFormat();

  const totalVolume = stats.longVolume + stats.shortVolume;
  const longPercent = totalVolume > 0 ? (stats.longVolume / totalVolume) * 100 : 50;
  const shortPercent = 100 - longPercent;

  return (
    <StatsPanel
      title="Liquidation Stats"
      icon={<Zap size={16} className="text-rose-400" />}
      iconClassName="bg-rose-500/10"
    >
      <div className="flex flex-col gap-4 h-full">
        {/* Period Selector */}
        <div className="flex bg-brand-dark rounded-lg p-0.5 border border-border-subtle">
          {TIMEFRAME_OPTIONS.map((option) => (
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-4 flex-1 content-center">
          <InlineStat
            icon={<DollarSign className="h-3.5 w-3.5 text-rose-400" />}
            label="Total Volume"
            value={<>${formatNumber(stats.totalVolume, format, { maximumFractionDigits: 0 })}</>}
            isLoading={statsLoading}
          />
          <InlineStat
            icon={<Zap className="h-3.5 w-3.5 text-rose-400" />}
            label="Liquidations"
            value={stats.liquidationsCount}
            isLoading={statsLoading}
          />
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
          <InlineStat
            label="Top Coin"
            value={stats.topCoin}
            valueClassName="text-brand-accent"
            isLoading={statsLoading}
          />
          <InlineStat
            icon={<BarChart3 className="h-3.5 w-3.5 text-amber-400" />}
            label="Avg Size"
            value={<>${formatNumber(stats.avgSize, format, { maximumFractionDigits: 0 })}</>}
            isLoading={statsLoading}
            className="hidden xl:block"
          />
          <InlineStat
            icon={<Target className="h-3.5 w-3.5 text-purple-400" />}
            label="Max Liq"
            value={<>${formatNumber(stats.maxLiq, format, { maximumFractionDigits: 0 })}</>}
            isLoading={statsLoading}
            className="hidden xl:block"
          />
          <LongShortRatioBar
            longPercent={longPercent}
            shortPercent={shortPercent}
            isLoading={statsLoading}
          />
        </div>
      </div>
    </StatsPanel>
  );
}
