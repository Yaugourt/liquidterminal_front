"use client";

import { Loader2 } from "lucide-react";
import { VaultChartData, VaultChartTimeframe } from "@/services/explorer/vault/types";
import { Chart } from '@/components/common/charts';
import { formatLargeNumber } from '@/lib/formatters/numberFormatting';

import { useDateFormat } from '@/store/date-format.store';
import { formatDate } from '@/lib/formatters/dateFormatting';
import { useState, useRef, useEffect } from 'react';

// Types pour le tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      timestamp: number;
    };
    value: number;
  }>;
}

type VaultChartType = "accountValue" | "pnl";

interface VaultChartDisplayProps {
  data: VaultChartData[];
  isLoading: boolean;
  error: Error | null;
  selectedChart: VaultChartType;
  onChartChange: (chart: VaultChartType) => void;
  selectedTimeframe: VaultChartTimeframe;
  onTimeframeChange: (timeframe: VaultChartTimeframe) => void;
  availableTimeframes: { value: VaultChartTimeframe; label: string }[];
  chartHeight: number;
}

const AnimatedTimeframeSelector = ({
  selectedTimeframe,
  onTimeframeChange,
  availableTimeframes
}: {
  selectedTimeframe: VaultChartTimeframe;
  onTimeframeChange: (timeframe: VaultChartTimeframe) => void;
  availableTimeframes: { value: VaultChartTimeframe; label: string }[];
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const selectedButton = buttonRefs.current[selectedTimeframe];
    if (selectedButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [selectedTimeframe]);

  return (
    <div
      ref={containerRef}
      className="relative flex bg-[#0A0D12] rounded-lg p-1 border border-white/5"
    >
      <div
        className="absolute top-1 bottom-1 bg-[#83E9FF] rounded-md transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left + 2,
          width: indicatorStyle.width - 4,
        }}
      />
      {availableTimeframes.map((timeframe) => (
        <button
          key={timeframe.value}
          ref={(el) => {
            buttonRefs.current[timeframe.value] = el;
          }}
          onClick={() => onTimeframeChange(timeframe.value)}
          className={`relative z-10 px-2 py-1 text-xs font-medium transition-colors duration-200 whitespace-nowrap rounded-md ${selectedTimeframe === timeframe.value ? 'text-[#051728] font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
};

export const VaultChartDisplay = ({
  data,
  isLoading,
  error,
  selectedChart,
  onChartChange,
  selectedTimeframe,
  onTimeframeChange,
  availableTimeframes,
  chartHeight
}: VaultChartDisplayProps) => {
  const { format: dateFormat } = useDateFormat();

  // Transform data for the selected chart type
  const transformedData = data.map(item => ({
    timestamp: item.timestamp,
    value: selectedChart === 'accountValue' ? item.accountValue : item.pnl,
    accountValue: item.accountValue,
    pnl: item.pnl
  }));

  // Tabs pour sélectionner le type de chart
  const chartTabs: { key: VaultChartType; label: string }[] = [
    { key: 'accountValue', label: 'Account Value' },
    { key: 'pnl', label: 'PnL' }
  ];

  const getColor = () => {
    return selectedChart === 'accountValue' ? '#83E9FF' : '#f9e370';
  };

  const formatYAxisValue = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value;

      return (
        <div className="bg-[#151A25] border border-white/10 p-2 rounded-lg shadow-lg">
          <p className="text-zinc-400 text-xs">
            {formatDate(new Date(data.timestamp), dateFormat)}
          </p>
          <p className="text-white font-bold">
            {selectedChart === 'accountValue'
              ? `Account Value: ${formatLargeNumber(value, { prefix: '$', decimals: 2 })}`
              : `PnL: ${value >= 0 ? '+' : ''}${formatLargeNumber(value, { prefix: '$', decimals: 2 })}`
            }
          </p>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="p-4 bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 flex items-center justify-center" style={{ height: chartHeight }}>
        <div className="flex items-center gap-2 text-rose-400">
          <span className="text-sm">Failed to load vault chart</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20 flex flex-col" style={{ height: chartHeight }}>
      {/* Header avec tabs et timeframe selector */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Titre */}
            <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Hyperliquidity Provider (HLP)
            </h2>

            {/* Tabs pour le type de chart */}
            <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
              {chartTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => onChartChange(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${selectedChart === tab.key
                    ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sélecteur de timeframe */}
          <AnimatedTimeframeSelector
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={onTimeframeChange}
            availableTimeframes={availableTimeframes}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-4 min-h-0">
        <Chart
          data={transformedData}
          isLoading={isLoading}
          error={error}
          height="100%"
          width="100%"
          formatValue={formatYAxisValue}
          formatTime={(time: string | number) => {
            const date = new Date(time);
            if (selectedTimeframe === "day") {
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (selectedTimeframe === "week") {
              return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
            } else if (selectedTimeframe === "month") {
              return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            } else if (selectedTimeframe === "allTime") {
              return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
            }
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          }}
          xAxisProps={{
            stroke: "#71717a",
            fontSize: 10
          }}
          yAxisProps={{
            stroke: "#71717a",
            fontSize: 10,
            domain: ['dataMin', 'dataMax'],
            padding: { top: 20, bottom: 20 }
          }}
          gridProps={{
            stroke: "rgba(255,255,255,0.05)"
          }}
          lineProps={{
            stroke: getColor(),
            strokeWidth: 2,
            dot: false,
            activeDot: { r: 4, fill: getColor() }
          }}
        >
          {{
            loading: (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF]" />
              </div>
            ),
            empty: (
              <div className="flex justify-center items-center h-full">
                <p className="text-zinc-500">No data available</p>
              </div>
            ),
            error: (
              <div className="flex justify-center items-center h-full">
                <p className="text-rose-400">Error loading data</p>
              </div>
            ),
            tooltip: CustomTooltip
          }}
        </Chart>
      </div>
    </div>
  );
}; 