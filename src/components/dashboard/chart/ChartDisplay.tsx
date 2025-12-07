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
    <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
      {availablePeriods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
            selectedPeriod === period
              ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
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
      <div className="flex-shrink-0 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                  <span className="text-[10px] text-zinc-500">
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
              <div className="flex items-center bg-[#0A0D12] rounded-md p-0.5 border border-white/5">
                <button
                  onClick={() => onCurrencyChange("USDC")}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                    selectedCurrency === "USDC" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  USDC
                </button>
                <button
                  onClick={() => onCurrencyChange("HYPE")}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                    selectedCurrency === "HYPE" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  HYPE
                </button>
              </div>
            )}
            
            {selectedFilter === "fees" && onFeeTypeChange && (
              <div className="flex items-center bg-[#0A0D12] rounded-md p-0.5 border border-white/5">
                <button
                  onClick={() => onFeeTypeChange("all")}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                    selectedFeeType === "all" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => onFeeTypeChange("spot")}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                    selectedFeeType === "spot" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
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
            <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-full min-h-[200px]">
            <p className="text-zinc-500 text-sm">No data available</p>
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
