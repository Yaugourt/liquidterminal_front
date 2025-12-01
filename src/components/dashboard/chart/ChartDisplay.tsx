"use client";

import { Loader2 } from "lucide-react";
import { useChartFormat, useChartData, ChartPeriod } from '@/components/common/charts';
import { ChartDisplayProps } from "@/components/types/dashboard.types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatLargeNumber, formatNumber } from '@/lib/formatters/numberFormatting';
import { useNumberFormat } from '@/store/number-format.store';

// Types for chart data
import { DashboardData } from "@/components/types/dashboard.types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: DashboardData;
  }>;
  label?: string | number;
}

interface Props extends ChartDisplayProps {
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
  chartHeight,
  selectedCurrency = "USDC",
  onCurrencyChange,
  onPeriodChange,
  availablePeriods,
  selectedFeeType = "all",
  onFeeTypeChange
}: Props) => {
  const { format } = useNumberFormat();
  const { formatValue } = useChartFormat();
  
  const adaptedHeight = chartHeight;
  
  const chartData = useChartData({
    data,
    getValue: (item: DashboardData) => item.value,
    getTimestamp: (item: DashboardData) => item.time
  });

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

  const formatOptions = {
    currency: 'USD',
    showCurrency: selectedFilter !== 'gas',
    minimumFractionDigits: 0,
    maximumFractionDigits: selectedFilter === 'gas' ? 0 : 2
  };

  const formatYAxisValue = (value: number) => {
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
  };

  const getTooltipSuffix = () => {
    switch (selectedFilter) {
      case "bridge":
        return "";
      case "strict":
        return " Fees";
      case "fees":
        return " Fees";
      case "gas":
        return "";
      default:
        return ` ${selectedCurrency}`;
    }
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      let formattedValue;
      if (selectedFilter === 'bridge') {
        formattedValue = formatLargeNumber(value, { prefix: '$', decimals: 2 });
      } else if (selectedFilter === 'gas' && selectedCurrency === 'USDC') {
        formattedValue = formatLargeNumber(value, { prefix: '$', decimals: 2 });
      } else if (selectedFilter === 'fees') {
        formattedValue = formatLargeNumber(value, { prefix: '$', decimals: 2 });
      } else if (selectedFilter === 'gas') {
        formattedValue = formatNumber(value, format);
      } else {
        formattedValue = formatValue(value, formatOptions);
      }
      return (
        <div className="bg-[#0B0E14]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-zinc-400 text-xs mb-1">
            {new Date(Number(label)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="font-bold text-sm" style={{ color: mainColor }}>
            {formattedValue + getTooltipSuffix()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ height: adaptedHeight }}>
      <div className="absolute top-4 left-6 right-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-sm text-white font-bold uppercase tracking-wider">
              {getTitle()}
            </h2>
            
            {/* Last Value Display */}
            {chartData.data.length > 0 && (
              <span className="text-lg font-bold text-white tracking-tight">
                {formatYAxisValue(chartData.data[chartData.data.length - 1].value)}
              </span>
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

      <div className="absolute inset-0 pt-16 pb-2 pr-2 pl-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
          </div>
        ) : chartData.data.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-zinc-500 text-sm">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={mainColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={mainColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => {
                  const date = new Date(time);
                  if (selectedPeriod === "7d") {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
                stroke="#525252"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#525252"
                fontSize={10}
                tickFormatter={(val) => formatLargeNumber(val, { prefix: '$', decimals: 0 })}
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={mainColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                activeDot={{ r: 4, strokeWidth: 0, fill: mainColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
