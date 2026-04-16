"use client";

import { useState, useMemo, useCallback } from "react";
import { ChartLoading, ChartEmpty, ChartError, HistogramChart, DataFreshness } from "@/components/common/charts";
import { useLiquidationsContext, CHART_PERIOD_OPTIONS } from "./LiquidationsContext";
import { useDateFormat } from '@/store/date-format.store';
import { formatDateTime } from '@/lib/formatters/dateFormatting';

type LiquidationChartType = "volume" | "count";

export const LiquidationsChartSection = () => {
  const [selectedChart, setSelectedChart] = useState<LiquidationChartType>("volume");
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  
  const { format: dateFormat } = useDateFormat();
  
  // Utilise les données du chart depuis le Context (période indépendante)
  const { 
    chartBuckets, 
    chartLoading, 
    chartPeriod,
    setChartPeriod,
    error,
    lastUpdated
  } = useLiquidationsContext();

  // Transformer les buckets en données de chart
  const chartData = useMemo(() => {
    if (!chartBuckets.length) return [];

    return chartBuckets.map((bucket) => {
      // Couleur basée sur la direction dominante
      const longRatio = bucket.totalVolume > 0 ? bucket.longVolume / bucket.totalVolume : 0.5;
      const color = longRatio > 0.5 ? "#10b981" : "#f43f5e"; // emerald for longs, rose for shorts
      const value = selectedChart === 'volume' ? bucket.totalVolume : bucket.liquidationsCount;
      
      return {
        time: bucket.timestampMs,
        value: isNaN(value) ? 0 : value,
        color,
      };
    }).filter(item => !isNaN(item.time) && !isNaN(item.value));
  }, [chartBuckets, selectedChart]);

  // Calculer le total depuis les buckets
  const totalFromBuckets = useMemo(() => {
    if (!chartBuckets.length) return { volume: 0, count: 0 };
    return chartBuckets.reduce((acc, bucket) => ({
      volume: acc.volume + bucket.totalVolume,
      count: acc.count + bucket.liquidationsCount
    }), { volume: 0, count: 0 });
  }, [chartBuckets]);

  const formatYAxisValue = useCallback((value: number) => {
    if (selectedChart === 'count') {
      return value.toFixed(0);
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  }, [selectedChart]);

  const handleCrosshairMove = useCallback((value: number | null, time: number | null) => {
    setHoverValue(value);
    setHoverTime(time);
  }, []);

  // Get total value for display
  const totalValue = selectedChart === 'volume' ? totalFromBuckets.volume : totalFromBuckets.count;
  const displayValue = hoverValue ?? totalValue;

  const chartTabs: { key: LiquidationChartType; label: string }[] = [
    { key: 'volume', label: 'Volume' },
    { key: 'count', label: 'Count' }
  ];

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                Liquidations
              </h2>
              <DataFreshness lastUpdated={lastUpdated} />
            </div>

            {/* Volume/Count Tabs */}
            <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
              {chartTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedChart(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${selectedChart === tab.key
                    ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                    : 'tab-inactive'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Value Display */}
            {displayValue !== null && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight tabular-nums">
                  {hoverValue !== null ? formatYAxisValue(hoverValue) : (
                    selectedChart === 'volume' 
                      ? formatYAxisValue(displayValue)
                      : `${displayValue} liquidations`
                  )}
                </span>
                {hoverTime && (
                  <span className="text-label text-text-muted">
                    {formatDateTime(new Date(hoverTime), dateFormat)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Period Selector (right side) */}
          <div className="flex bg-brand-dark rounded-lg p-0.5 border border-border-subtle">
            {CHART_PERIOD_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setChartPeriod(option.value)}
                className={`px-2 py-1 rounded-md text-label transition-all ${
                  chartPeriod === option.value
                    ? 'bg-rose-500/20 text-rose-400 font-bold'
                    : 'tab-inactive'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {error && !chartBuckets.length ? (
          <ChartError message="Failed to load liquidation data" />
        ) : chartLoading ? (
          <ChartLoading />
        ) : chartData.length === 0 ? (
          <ChartEmpty message="No liquidation data available" />
        ) : (
          <HistogramChart
            data={chartData}
            formatValue={formatYAxisValue}
            onCrosshairMove={handleCrosshairMove}
          />
        )}
      </div>
    </div>
  );
};
