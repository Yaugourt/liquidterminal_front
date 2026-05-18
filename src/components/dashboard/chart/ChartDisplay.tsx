"use client";

import { useState, useCallback, useMemo } from "react";
import { ChartPeriod, PeriodSelector, ChartLoading, ChartEmpty, ChartError, chartPalette } from '@/components/common';
import { FilterType, DashboardData } from "@/components/types/dashboard.types";
import { AuroraAreaChart } from "@/components/common";
import { formatLargeNumber, formatNumber } from '@/lib/formatters/numberFormatting';
import { useNumberFormat } from '@/store/number-format.store';

interface Props {
  data: DashboardData[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  selectedFilter: FilterType;
  selectedPeriod: ChartPeriod;
  selectedCurrency?: "HYPE" | "USDC";
  onCurrencyChange?: (currency: "HYPE" | "USDC") => void;
  onPeriodChange: (period: ChartPeriod) => void;
  availablePeriods: ChartPeriod[];
  selectedFeeType?: "all" | "spot";
  onFeeTypeChange?: (feeType: "all" | "spot") => void;
}

export const ChartDisplay = ({
  data,
  isLoading,
  error,
  onRetry,
  selectedFilter,
  selectedPeriod,
  selectedCurrency = "USDC",
  onCurrencyChange,
  onPeriodChange,
  availablePeriods,
  selectedFeeType = "all",
  onFeeTypeChange
}: Props) => {
  const { format } = useNumberFormat();

  // State for crosshair tooltip
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  // Get latest value for display
  const latestValue = useMemo(() => {
    if (data.length === 0) return null;
    return data[data.length - 1].value;
  }, [data]);

  // Current displayed value (hover or latest)
  const displayValue = hoverValue ?? latestValue;

  const getTitle = () => {
    switch (selectedFilter) {
      case "bridge":
        return "Bridge TVL";
      case "strict":
        return "Fees";
      case "fees":
        return "Total Fees";
      default:
        return `Auction Price (${selectedCurrency})`;
    }
  };

  const getChartColor = () => {
    switch (selectedFilter) {
      case "bridge": return chartPalette.accent;
      case "fees": return chartPalette.gold;
      case "strict": return chartPalette.gold;
      default: return chartPalette.accent;
    }
  };

  const mainColor = getChartColor();

  const formatYAxisValue = useCallback((value: number) => {
    if (selectedFilter === 'bridge') {
      return formatLargeNumber(value, { prefix: '$', decimals: 2 });
    }
    if (selectedFilter === 'gas' && selectedCurrency === 'USDC') {
      return formatLargeNumber(value, { prefix: '$', decimals: 2 });
    }
    if (selectedFilter === 'fees') {
      return formatLargeNumber(value, { prefix: '$', decimals: 2 });
    }
    return formatNumber(value, format);
  }, [selectedFilter, selectedCurrency, format]);

  const handleCrosshairMove = useCallback((value: number | null, time: number | null) => {
    setHoverValue(value);
    setHoverTime(time);
  }, []);

  // Format data for the Aurora chart
  const chartData = useMemo(() => {
    return data.map((item: DashboardData) => ({
      time: item.time,
      value: item.value,
    }));
  }, [data]);

  return (
    <div className="relative w-full h-full flex flex-col min-h-[300px]">
      {/* Ambient color glow — keyed off chart color so each filter gets its own mood */}
      <div
        className="pointer-events-none absolute -top-16 right-0 h-48 w-48 rounded-full blur-3xl opacity-40"
        style={{ background: `${mainColor}22` }}
      />

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <h2 className="text-[11px] text-text-secondary font-semibold uppercase tracking-[0.18em]">
              {getTitle()}
            </h2>

            {/* Value Display */}
            {displayValue !== null && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-text-primary tracking-tight tabular-nums">
                  {formatYAxisValue(displayValue)}
                </span>
                {hoverTime && (
                  <span className="text-label text-text-tertiary tabular-nums">
                    {new Date(hoverTime).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            )}

            {selectedFilter !== "bridge" && selectedFilter !== "fees" && onCurrencyChange && (
              <div className="flex items-center rounded-lg border border-border-subtle bg-black/30 p-0.5">
                {(["USDC", "HYPE"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => onCurrencyChange(c)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold tabular-nums transition-colors ${
                      selectedCurrency === c
                        ? "bg-white/[0.06] ring-1 ring-white/10 text-text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {selectedFilter === "fees" && onFeeTypeChange && (
              <div className="flex items-center rounded-lg border border-border-subtle bg-black/30 p-0.5">
                {(["all", "spot"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onFeeTypeChange(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                      selectedFeeType === t
                        ? "bg-white/[0.06] ring-1 ring-white/10 text-text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {t}
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

      {/* Chart Container - fills remaining space */}
      <div className="relative z-10 flex-1 px-2 pb-2">
        {error ? (
          <ChartError onRetry={onRetry} />
        ) : isLoading ? (
          <ChartLoading />
        ) : chartData.length === 0 ? (
          <ChartEmpty suggestion="Try selecting a different time period" />
        ) : (
          <AuroraAreaChart
            data={chartData}
            lineColor={mainColor}
            formatValue={formatYAxisValue}
            onCrosshairMove={handleCrosshairMove}
          />
        )}
      </div>
    </div>
  );
};
