"use client";

import { useState, useMemo, useCallback } from 'react';
import { Loader2, Database } from "lucide-react";
import { formatLargeNumber, formatNumber } from '@/lib/formatters/numberFormatting';
import { useNumberFormat } from '@/store/number-format.store';
import { ChartPeriod } from '@/components/common/charts';
import { GlassPanel } from "@/components/ui/glass-panel";
import { LightweightChart } from "@/components/common/charts/LightweightChart";

interface AuctionDataPoint {
  time: number;
  value: number;
}

interface AuctionChartProps {
  data: AuctionDataPoint[];
  isLoading: boolean;
  selectedCurrency: "HYPE" | "USDC";
  onCurrencyChange: (currency: "HYPE" | "USDC") => void;
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  availablePeriods: ChartPeriod[];
  chartHeight: number;
  marketType: "spot" | "perp";
}

export const AuctionChart = ({
  data,
  isLoading,
  selectedCurrency,
  onCurrencyChange,
  selectedPeriod,
  onPeriodChange,
  availablePeriods,
  chartHeight,
  marketType
}: AuctionChartProps) => {
  const { format } = useNumberFormat();

  // State for crosshair tooltip (hover)
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  // Get latest value for display
  const latestValue = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data[data.length - 1].value;
  }, [data]);

  // Current displayed value (hover or latest)
  const displayValue = hoverValue ?? latestValue;

  const formatYAxisValue = useCallback((value: number) => {
    if (selectedCurrency === 'USDC') {
      return formatLargeNumber(value, { prefix: '$', decimals: 2 });
    }
    return formatNumber(value, format);
  }, [selectedCurrency, format]);

  const handleCrosshairMove = useCallback((value: number | null, time: number | null) => {
    setHoverValue(value);
    setHoverTime(time);
  }, []);

  // Format data for LightweightChart
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(d => ({
      time: d.time,
      value: d.value
    }));
  }, [data]);

  // If perp coming soon
  if (marketType === "perp") {
    return (
      <GlassPanel
        className="w-full relative overflow-hidden flex flex-col items-center justify-center p-4"
        style={{ height: chartHeight }}
      >
        <div className="flex flex-col items-center text-center">
          <Database className="w-10 h-10 mb-3 text-text-muted" />
          <p className="text-text-secondary text-sm mb-1">Coming Soon</p>
          <p className="text-text-muted text-xs">Perpetual auctions chart will be available soon.</p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel
      className="w-full h-full relative overflow-hidden flex flex-col"
      style={{ height: chartHeight }}
    >
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
        <div className="flex items-center justify-between flex-wrap gap-2 pointer-events-auto">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
              Auction Price ({selectedCurrency})
            </h2>

            {displayValue !== null && (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white tracking-tight">
                  {formatYAxisValue(displayValue)}
                </span>
                {hoverTime && (
                  <span className="text-[10px] text-text-muted">
                    {new Date(hoverTime).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            )}

            <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
              <button
                onClick={() => onCurrencyChange("USDC")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${selectedCurrency === "USDC"
                  ? "bg-brand-accent text-brand-tertiary shadow-sm font-bold"
                  : "text-text-secondary hover:text-zinc-200 hover:bg-white/5"
                  }`}
              >
                USDC
              </button>
              <button
                onClick={() => onCurrencyChange("HYPE")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${selectedCurrency === "HYPE"
                  ? "bg-brand-accent text-brand-tertiary shadow-sm font-bold"
                  : "text-text-secondary hover:text-zinc-200 hover:bg-white/5"
                  }`}
              >
                HYPE
              </button>
            </div>
          </div>

          <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle gap-1">
            {availablePeriods.map((period) => (
              <button
                key={period}
                onClick={() => onPeriodChange(period)}
                className={`px-2 py-1 text-xs font-medium transition-colors duration-200 whitespace-nowrap rounded-md ${selectedPeriod === period ? 'text-brand-tertiary bg-brand-accent font-bold' : 'text-text-secondary hover:text-zinc-200'
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="absolute inset-0 pt-16 pb-2 px-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
          </div>
        ) : (!data || data.length === 0) ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-text-muted">No data available</p>
          </div>
        ) : (
          <LightweightChart
            data={chartData}
            lineColor="#f9e370"
            areaTopColor="rgba(249, 227, 112, 0.4)"
            formatValue={formatYAxisValue}
            onCrosshairMove={handleCrosshairMove}
          />
        )}
      </div>
    </GlassPanel>
  );
};
