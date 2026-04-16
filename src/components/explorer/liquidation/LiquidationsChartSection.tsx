"use client";

import { useState, useMemo, useCallback, useId } from "react";
import { motion } from "framer-motion";
import {
  ChartLoading,
  ChartEmpty,
  ChartError,
  DataFreshness,
  AuroraHistogramChart,
} from "@/components/common/charts";
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
    <div className="relative w-full h-full flex flex-col p-4 overflow-hidden">
      {/* Ambient rose/emerald glow — mirrors the long/short bipolar nature of liquidations */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-emerald-500/[0.08] blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                <span className="h-1 w-1 rounded-full bg-rose-400" />
                Liquidations
              </div>
              <DataFreshness lastUpdated={lastUpdated} />
            </div>

            {/* Volume/Count pill tabs */}
            <div className="flex items-center rounded-xl border border-border-subtle bg-black/30 p-1">
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
                        className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${
                        isActive ? "text-white" : "text-text-secondary hover:text-white"
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
                <span className="text-lg font-bold text-white tracking-tight tabular-nums">
                  {hoverValue !== null ? formatYAxisValue(hoverValue) : (
                    selectedChart === 'volume'
                      ? formatYAxisValue(displayValue)
                      : `${displayValue} liquidations`
                  )}
                </span>
                {hoverTime && (
                  <span className="text-label text-text-muted tabular-nums">
                    {formatDateTime(new Date(hoverTime), dateFormat)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Period Selector — rose-accented aurora pill */}
          <div className="flex items-center rounded-xl border border-rose-500/20 bg-black/30 p-1">
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
                      className="absolute inset-0 rounded-lg bg-rose-500/15 ring-1 ring-rose-400/30"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      isActive ? "text-rose-300" : "text-text-secondary hover:text-white"
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
        ) : chartData.length === 0 ? (
          <ChartEmpty message="No liquidation data available" />
        ) : (
          <AuroraHistogramChart
            data={chartData}
            defaultColor="#f43f5e"
            formatValue={formatYAxisValue}
            onCrosshairMove={handleCrosshairMove}
          />
        )}
      </div>
    </div>
  );
};
