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

      {/* chart-legend — pastille + nom de série + valeur courante */}
      <div className="relative z-10 flex-shrink-0 flex flex-wrap items-center gap-x-4 gap-y-2 px-3.5 sm:px-4 pt-3.5 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-sm"
            style={{ background: mainColor }}
          />
          <span className="text-[11px] font-medium text-text-secondary">
            {getTitle()}
          </span>
          {displayValue !== null && (
            <span className="mono text-[11px] font-semibold text-text-primary ml-0.5">
              {formatYAxisValue(displayValue)}
            </span>
          )}
        </div>

        {hoverTime && (
          <span className="mono text-[10px] text-text-tertiary">
            {new Date(hoverTime).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )}

        {selectedFilter !== "bridge" && selectedFilter !== "fees" && onCurrencyChange && (
          <div className="flex gap-px bg-base rounded-md p-0.5 border border-border-default">
            {(["USDC", "HYPE"] as const).map((c) => (
              <button
                key={c}
                onClick={() => onCurrencyChange(c)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium tabular-nums transition-colors ${
                  selectedCurrency === c
                    ? "bg-surface-2 text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {selectedFilter === "fees" && onFeeTypeChange && (
          <div className="flex gap-px bg-base rounded-md p-0.5 border border-border-default">
            {(["all", "spot"] as const).map((t) => (
              <button
                key={t}
                onClick={() => onFeeTypeChange(t)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                  selectedFeeType === t
                    ? "bg-surface-2 text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="ml-auto">
          <PeriodSelector
            selected={selectedPeriod}
            onChange={onPeriodChange}
            options={availablePeriods}
            variant="aurora"
          />
        </div>
      </div>

      {/* Chart Container - fills remaining space (hauteur définie pour éviter le mesurage à 0) */}
      <div className="relative z-10 flex-1 min-h-[280px] px-2 pb-2">
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
            height={280}
          />
        )}
      </div>
    </div>
  );
};
