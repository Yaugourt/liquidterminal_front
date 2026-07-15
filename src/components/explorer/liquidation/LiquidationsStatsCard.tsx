"use client";

import { formatNumber } from "@/lib/formatters/numberFormatting";
import { Zap, TrendingUp, TrendingDown, DollarSign, BarChart3, Target } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";
import { useLiquidationsContext } from "./LiquidationsContext";
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
      <div className={cn("font-bold text-lg pl-5", valueClassName ?? "text-text-primary")}>
        {isLoading ? <span className="animate-pulse text-text-tertiary">--</span> : value}
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
        <div className="flex-1 h-2 bg-gradient-to-r from-danger to-danger rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-success to-success rounded-full transition-all duration-500"
            style={{ width: `${longPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-success font-medium">
            {isLoading ? '--' : `${longPercent.toFixed(0)}%`}
          </span>
          <span className="text-text-tertiary">/</span>
          <span className="text-danger font-medium">
            {isLoading ? '--' : `${shortPercent.toFixed(0)}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

export function LiquidationsStatsCard() {
  const {
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
      icon={<Zap size={16} className="text-danger" />}
      iconClassName="bg-danger/10"
      // Single honest window label: the backend serves one stats snapshot and
      // ignores narrower windows, so a period selector here would be cosmetic.
      headerAction={
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-danger/10 text-danger border border-danger/25">
          24h
        </span>
      }
    >
      <div className="flex flex-col gap-4 h-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-4 flex-1 content-center">
          <InlineStat
            icon={<DollarSign className="h-3.5 w-3.5 text-danger" />}
            label="Total Volume"
            value={<>${formatNumber(stats.totalVolume, format, { maximumFractionDigits: 0 })}</>}
            isLoading={statsLoading}
          />
          <InlineStat
            icon={<Zap className="h-3.5 w-3.5 text-danger" />}
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
                <TrendingUp className="h-3.5 w-3.5 text-success" />
                <span className="text-success font-bold text-sm">
                  {statsLoading ? '--' : stats.longCount}
                </span>
              </div>
              <span className="text-text-tertiary">/</span>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-danger" />
                <span className="text-danger font-bold text-sm">
                  {statsLoading ? '--' : stats.shortCount}
                </span>
              </div>
            </div>
          </div>
          <InlineStat
            label="Top Coin"
            value={stats.topCoin}
            valueClassName="text-brand"
            isLoading={statsLoading}
          />
          <InlineStat
            icon={<BarChart3 className="h-3.5 w-3.5 text-gold" />}
            label="Avg Size"
            value={<>${formatNumber(stats.avgSize, format, { maximumFractionDigits: 0 })}</>}
            isLoading={statsLoading}
            className="hidden xl:block"
          />
          <InlineStat
            icon={<Target className="h-3.5 w-3.5 text-text-primary" />}
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
