"use client";

import { useState, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { ChartPeriod } from '@/components/common/charts';
import { FilterType, DashboardData } from "@/components/types/dashboard.types";
import { LightweightChart } from "@/components/common/charts/LightweightChart";
import { formatLargeNumber, formatNumber } from '@/lib/formatters/numberFormatting';
import { useNumberFormat } from '@/store/number-format.store';

interface Props {
  data: DashboardData[];
  isLoading: boolean;
  selectedFilter: FilterType;
  selectedPeriod: ChartPeriod;
  selectedCurrency?: "HYPE" | "USDC";
  onCurrencyChange?: (currency: "HYPE" | "USDC") => void;
  onPeriodChange: (period: ChartPeriod) => void;
  availablePeriods: ChartPeriod[];
  selectedFeeType?: "all" | "spot";
  onFeeTypeChange?: (feeType: "all" | "spot") => void;
}

const AnimatedPeriodSelector = ({
  selectedPeriod,
  onPeriodChange,
  availablePeriods
}: {
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  availablePeriods: ChartPeriod[];
}) => {
  return (
    <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
      {availablePeriods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`px-2 py-1 rounded-md text-label transition-all ${selectedPeriod === period
              ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
              : 'text-text-secondary hover:text-zinc-200 hover:bg-white/5'
            }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export const ChartDisplay = ({
  data,
  isLoading,
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
      case "bridge": return "#83e9ff"; // Main Cyan
      case "fees": return "#f9e370"; // Accent Yellow
      case "strict": return "#f9e370"; // Accent Yellow
      default: return "#83e9ff"; // Default Cyan
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

  // Format data for LightweightChart
  const chartData = useMemo(() => {
    return data.map((item: DashboardData) => ({
      time: item.time,
      value: item.value,
    }));
  }, [data]);

  return (
    <div className="w-full h-full flex flex-col min-h-[300px]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <h2 className="text-sm text-white font-bold uppercase tracking-wider">
              {getTitle()}
            </h2>

            {/* Value Display */}
            {displayValue !== null && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">
                  {formatYAxisValue(displayValue)}
                </span>
                {hoverTime && (
                  <span className="text-label text-text-muted">
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
              <div className="flex items-center bg-brand-dark rounded-md p-0.5 border border-border-subtle">
                <button
                  onClick={() => onCurrencyChange("USDC")}
                  className={`px-2 py-0.5 text-label rounded ${selectedCurrency === "USDC" ? "bg-white/10 text-white" : "text-text-muted hover:text-white/80"
                    }`}
                >
                  USDC
                </button>
                <button
                  onClick={() => onCurrencyChange("HYPE")}
                  className={`px-2 py-0.5 text-label rounded ${selectedCurrency === "HYPE" ? "bg-white/10 text-white" : "text-text-muted hover:text-white/80"
                    }`}
                >
                  HYPE
                </button>
              </div>
            )}

            {selectedFilter === "fees" && onFeeTypeChange && (
              <div className="flex items-center bg-brand-dark rounded-md p-0.5 border border-border-subtle">
                <button
                  onClick={() => onFeeTypeChange("all")}
                  className={`px-2 py-0.5 text-label rounded ${selectedFeeType === "all" ? "bg-white/10 text-white" : "text-text-muted hover:text-white/80"
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => onFeeTypeChange("spot")}
                  className={`px-2 py-0.5 text-label rounded ${selectedFeeType === "spot" ? "bg-white/10 text-white" : "text-text-muted hover:text-white/80"
                    }`}
                >
                  Spot
                </button>
              </div>
            )}
          </div>

          <AnimatedPeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={onPeriodChange}
            availablePeriods={availablePeriods}
          />
        </div>
      </div>

      {/* Chart Container - fills remaining space */}
      <div className="flex-1 px-2 pb-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-full min-h-[200px]">
            <p className="text-text-muted text-sm">No data available</p>
          </div>
        ) : (
          <LightweightChart
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
