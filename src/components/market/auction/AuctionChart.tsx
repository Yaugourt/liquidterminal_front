"use client";

import { useState, useMemo, useCallback } from 'react';
import { formatLargeNumber, formatNumber } from '@/lib/formatters/numberFormatting';
import { useNumberFormat } from '@/store/number-format.store';
import { ChartPeriod, PeriodSelector, ChartLoading, ChartEmpty, ChartError, chartPalette } from '@/components/common';
import { AuroraAreaChart } from "@/components/common";
import { Card } from '@/components/ui/card';

interface AuctionDataPoint {
  time: number;
  value: number;
}

interface AuctionChartProps {
  data: AuctionDataPoint[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  selectedCurrency: "HYPE" | "USDC";
  onCurrencyChange: (currency: "HYPE" | "USDC") => void;
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  availablePeriods: ChartPeriod[];
  chartHeight: number;
  marketType: "spot" | "perp";
}

// Auction chart is gold-accented in both market modes
const AUCTION_COLOR = chartPalette.gold;

export const AuctionChart = ({
  data,
  isLoading,
  error,
  onRetry,
  selectedCurrency,
  onCurrencyChange,
  selectedPeriod,
  onPeriodChange,
  availablePeriods,
  chartHeight,
  marketType
}: AuctionChartProps) => {
  const { format } = useNumberFormat();

  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const latestValue = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data[data.length - 1].value;
  }, [data]);

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

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(d => ({ time: d.time, value: d.value }));
  }, [data]);

  return (
    <Card
      className="w-full h-full relative flex flex-col overflow-hidden"
      style={{ height: chartHeight }}
    >
      {/* Ambient gold glow — Aurora aesthetic */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-60 w-60 rounded-full bg-brand-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-brand-accent/[0.06] blur-3xl" />

      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none">
        <div className="flex items-center justify-between flex-wrap gap-2 pointer-events-auto">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              <span className="h-1 w-1 rounded-full bg-brand-gold" />
              {marketType === "perp" ? "Gas Price (HYPE)" : `Auction Price (${selectedCurrency})`}
            </div>

            {displayValue !== null && (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white tracking-tight tabular-nums">
                  {formatYAxisValue(displayValue)}
                </span>
                {hoverTime && (
                  <span className="text-label text-text-muted tabular-nums">
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

            {/* Currency selector - only show for spot */}
            {marketType === "spot" && (
              <div className="flex items-center rounded-xl border border-border-subtle bg-black/30 p-0.5">
                {(["USDC", "HYPE"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => onCurrencyChange(c)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold tabular-nums transition-colors ${
                      selectedCurrency === c
                        ? "bg-white/[0.06] ring-1 ring-white/10 text-white"
                        : "text-text-secondary hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <PeriodSelector
            selected={selectedPeriod}
            onChange={onPeriodChange}
            options={availablePeriods}
            variant="aurora"
          />
        </div>
      </div>

      {/* Chart Container */}
      <div className="absolute inset-0 pt-16 pb-2 px-2 z-10">
        {error ? (
          <ChartError message="Failed to load auction data" onRetry={onRetry} />
        ) : isLoading ? (
          <ChartLoading />
        ) : (!data || data.length === 0) ? (
          <ChartEmpty />
        ) : (
          <AuroraAreaChart
            data={chartData}
            lineColor={AUCTION_COLOR}
            formatValue={formatYAxisValue}
            onCrosshairMove={handleCrosshairMove}
          />
        )}
      </div>
    </Card>
  );
};
