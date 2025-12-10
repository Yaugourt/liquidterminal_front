"use client";

import { Loader2 } from "lucide-react";
import { VaultChartData, VaultChartTimeframe } from "@/services/explorer/vault/types";
import { LightweightChart } from '@/components/common/charts/LightweightChart';
import { useDateFormat } from '@/store/date-format.store';
import { formatDate } from '@/lib/formatters/dateFormatting';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

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
      className="relative flex bg-brand-dark rounded-lg p-1 border border-white/5"
    >
      <div
        className="absolute top-1 bottom-1 bg-brand-accent rounded-md transition-all duration-300 ease-out"
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
          className={`relative z-10 px-2 py-1 text-xs font-medium transition-colors duration-200 whitespace-nowrap rounded-md ${selectedTimeframe === timeframe.value ? 'text-brand-tertiary font-bold' : 'text-zinc-400 hover:text-zinc-200'
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
  availableTimeframes
}: VaultChartDisplayProps) => {
  const { format: dateFormat } = useDateFormat();
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  // Transform data for the selected chart type
  const chartData = useMemo(() => {
    return data.map(item => ({
      time: item.timestamp,
      value: selectedChart === 'accountValue' ? item.accountValue : item.pnl,
    }));
  }, [data, selectedChart]);

  // Tabs pour sélectionner le type de chart
  const chartTabs: { key: VaultChartType; label: string }[] = [
    { key: 'accountValue', label: 'Account Value' },
    { key: 'pnl', label: 'PnL' }
  ];

  const getColor = () => {
    return selectedChart === 'accountValue' ? '#83E9FF' : '#f9e370';
  };

  const formatYAxisValue = useCallback((value: number) => {
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
  }, []);

  const handleCrosshairMove = useCallback((value: number | null, time: number | null) => {
    setHoverValue(value);
    setHoverTime(time);
  }, []);

  // Get latest value for display
  const latestValue = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData[chartData.length - 1].value;
  }, [chartData]);

  const displayValue = hoverValue ?? latestValue;

  if (error) {
    return (
      <div className="w-full h-full flex flex-col bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-2 text-rose-400">
            <span className="text-sm">Failed to load vault chart</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
      {/* Header avec tabs et timeframe selector */}
      <div className="flex-shrink-0 p-4 pb-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Titre */}
            <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Hyperliquidity Provider (HLP)
            </h2>

            {/* Tabs pour le type de chart */}
            <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5">
              {chartTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => onChartChange(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${selectedChart === tab.key
                    ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Value Display */}
            {displayValue !== null && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">
                  {formatYAxisValue(displayValue)}
                </span>
                {hoverTime && (
                  <span className="text-[10px] text-zinc-500">
                    {formatDate(new Date(hoverTime), dateFormat)}
                  </span>
                )}
              </div>
            )}
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
      <div className="flex-1 min-h-0 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full min-h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-full min-h-[200px]">
            <p className="text-zinc-500">No data available</p>
          </div>
        ) : (
          <LightweightChart
            data={chartData}
            lineColor={getColor()}
            formatValue={formatYAxisValue}
            onCrosshairMove={handleCrosshairMove}
          />
        )}
      </div>
    </div>
  );
};
