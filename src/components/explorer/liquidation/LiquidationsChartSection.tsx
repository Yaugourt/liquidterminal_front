"use client";

import { useState, useMemo, useCallback, useId } from "react";
import { motion } from "framer-motion";
import {
  ChartLoading,
  ChartEmpty,
  ChartError,
  DataFreshness,
  AuroraHistogramChart,
  chartPalette,
} from "@/components/common";
import { useLiquidationsContext, CHART_PERIOD_OPTIONS } from "./LiquidationsContext";
import { useDateFormat } from '@/store/date-format.store';
import { formatDateTime } from '@/lib/formatters/dateFormatting';

type LiquidationChartType = "volume" | "count";

export const LiquidationsChartSection = () => {
  const [selectedChart, setSelectedChart] = useState<LiquidationChartType>("volume");
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const layoutId = useId().replace(/:/g, "");

  const { format: dateFormat } = useDateFormat();

  const {
    chartBuckets,
    chartLoading,
    chartPeriod,
    setChartPeriod,
    error,
    lastUpdated
  } = useLiquidationsContext();

  // The endpoint returns a full grid of buckets even when the window holds no
  // liquidations; an all-zero series must read as "no data", not a $0 chart.
  const chartHasData = useMemo(
    () => chartBuckets.some((bucket) => bucket.totalVolume > 0 || bucket.liquidationsCount > 0),
    [chartBuckets]
  );

  // Transform buckets into chart data points
  const chartData = useMemo(() => {
    if (!chartBuckets.length) return [];

    return chartBuckets.map((bucket) => {
      // Couleur basée sur la direction dominante
      const longRatio = bucket.totalVolume > 0 ? bucket.longVolume / bucket.totalVolume : 0.5;
      const color = longRatio > 0.5 ? chartPalette.up : chartPalette.down; // emerald for longs, rose for shorts
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
    <div className="relative w-full h-full flex flex-col p-4 overflow-hidden">
      {/* Ambient rose/emerald glow — mirrors the long/short bipolar nature of liquidations */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-danger/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-success/[0.08] blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                <span className="h-1 w-1 rounded-full bg-danger" />
                Liquidations
              </div>
              <DataFreshness lastUpdated={lastUpdated} />
            </div>

            {/* Volume/Count pill tabs */}
            <div className="flex items-center rounded-lg border border-border-subtle bg-surface-2 p-1">
              {chartTabs.map((tab) => {
                const isActive = selectedChart === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedChart(tab.key)}
                    className="relative rounded-lg px-3 py-1 text-[11px] font-semibold whitespace-nowrap"
                  >
                    {isActive && (
                      <motion.span
                        layoutId={`liq-chart-tab-${layoutId}`}
                        className="absolute inset-0 rounded-lg bg-surface-3 ring-1 ring-border-default"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${
                        isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Value Display */}
            {displayValue !== null && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-text-primary tracking-tight tabular-nums">
                  {hoverValue !== null ? formatYAxisValue(hoverValue) : (
                    selectedChart === 'volume'
                      ? formatYAxisValue(displayValue)
                      : `${displayValue} liquidations`
                  )}
                </span>
                {hoverTime && (
                  <span className="text-label text-text-tertiary tabular-nums">
                    {formatDateTime(new Date(hoverTime), dateFormat)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Period Selector — rose-accented aurora pill */}
          <div className="flex items-center rounded-lg border border-danger/20 bg-surface-2 p-1">
            {CHART_PERIOD_OPTIONS.map((option) => {
              const isActive = chartPeriod === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setChartPeriod(option.value)}
                  className="relative rounded-lg px-2.5 py-1 text-[11px] font-semibold tabular-nums whitespace-nowrap min-w-[28px]"
                >
                  {isActive && (
                    <motion.span
                      layoutId={`liq-period-${layoutId}`}
                      className="absolute inset-0 rounded-lg bg-danger/15 ring-1 ring-danger/30"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      isActive ? "text-danger" : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 flex-1 min-h-0">
        {error && !chartBuckets.length ? (
          <ChartError message="Failed to load liquidation data" />
        ) : chartLoading ? (
          <ChartLoading />
        ) : chartData.length === 0 || !chartHasData ? (
          <ChartEmpty message="No liquidation history available for this period" />
        ) : (
          <AuroraHistogramChart
            data={chartData}
            defaultColor={chartPalette.down}
            formatValue={formatYAxisValue}
            onCrosshairMove={handleCrosshairMove}
          />
        )}
      </div>
    </div>
  );
};
