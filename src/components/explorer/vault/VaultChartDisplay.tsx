"use client";

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { VaultChartData, VaultChartTimeframe } from "@/services/explorer/vault/types";
import { Chart } from '@/components/common/charts';
import { formatLargeNumber } from '@/lib/numberFormatting';

import { useDateFormat } from '@/store/date-format.store';
import { formatDate } from '@/lib/dateFormatting';
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
      className="relative flex items-center bg-[#051728] rounded-md p-0.5 border border-[#83E9FF4D]"
    >
      <div
        className="absolute top-1 bottom-1 bg-[#83E9FF] rounded-sm transition-all duration-300 ease-out opacity-80"
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
          className="relative z-10 px-2 py-1 text-xs font-medium text-white transition-colors duration-200 whitespace-nowrap hover:text-[#83E9FF]"
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
        <div className="bg-[#051728] border border-[#83E9FF4D] p-2 rounded-md">
          <p className="text-white text-xs">
            {formatDate(new Date(data.timestamp), dateFormat)}
          </p>
          <p className="text-[#83E9FF] font-medium">
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
      <Card className="p-4 bg-[#051728E5] border border-red-500/50 shadow-sm backdrop-blur-sm rounded-md">
        <div className="flex items-center gap-2 text-red-400">
          <span className="text-sm">Failed to load vault chart</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg" style={{ height: chartHeight }}>
      {/* Header avec tabs et timeframe selector */}
      <div className="absolute top-2 left-3 sm:left-6 right-3 sm:right-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Titre */}
            <h2 className="text-sm text-white font-medium">
              Hyperliquidity Provider (HLP)
            </h2>
            
            {/* Tabs pour le type de chart */}
            <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
              {chartTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => onChartChange(tab.key)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedChart === tab.key
                      ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                      : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
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
      <div className="absolute inset-0 p-4 pt-16">
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
            stroke: "#FFFFFF99",
            fontSize: 12
          }}
          yAxisProps={{
            stroke: "#FFFFFF99",
            fontSize: 12,
            domain: ['dataMin', 'dataMax'],
            padding: { top: 20, bottom: 20 }
          }}
          gridProps={{
            stroke: "#83E9FF1A"
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
                <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
              </div>
            ),
            empty: (
              <div className="flex justify-center items-center h-full">
                <p className="text-[#FFFFFF80]">No data available</p>
              </div>
            ),
            error: (
              <div className="flex justify-center items-center h-full">
                <p className="text-red-400">Error loading data</p>
              </div>
            ),
            tooltip: CustomTooltip
          }}
        </Chart>
      </div>
    </Card>
  );
}; 