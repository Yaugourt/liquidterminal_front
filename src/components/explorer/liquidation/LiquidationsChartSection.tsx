"use client";

import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import {
  ChartLoading,
  ChartEmpty,
  ChartError,
  AuroraHistogramChart,
  chartPalette,
  CardHead,
} from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useDateFormat } from "@/store/date-format.store";
import { useLiquidationsContext, CHART_PERIOD_OPTIONS } from "./LiquidationsContext";
import type { HistoricalChartPeriod } from "@/services/explorer/liquidation/types";

type LiquidationChartType = "volume" | "count";

const CHART_TABS: { value: LiquidationChartType; label: string }[] = [
  { value: "volume", label: "Volume" },
  { value: "count", label: "Count" },
];

/**
 * Liquidation history card — V4 card-head (icon + title + period tag +
 * metric/period PillTabs) over an AuroraHistogramChart. Bars are colored by
 * the dominant side of each bucket (long → success, short → danger).
 */
export function LiquidationsChartSection() {
  const [selectedChart, setSelectedChart] = useState<LiquidationChartType>("volume");
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const { format: dateFormat } = useDateFormat();

  const { chartBuckets, chartLoading, chartPeriod, setChartPeriod, error } =
    useLiquidationsContext();

  // The endpoint returns a full grid of buckets even when the window holds no
  // liquidations; an all-zero series must read as "no data", not a $0 chart.
  const chartHasData = useMemo(
    () => chartBuckets.some((b) => b.totalVolume > 0 || b.liquidationsCount > 0),
    [chartBuckets]
  );

  const chartData = useMemo(() => {
    return chartBuckets
      .map((bucket) => {
        const longRatio = bucket.totalVolume > 0 ? bucket.longVolume / bucket.totalVolume : 0.5;
        const value = selectedChart === "volume" ? bucket.totalVolume : bucket.liquidationsCount;
        return {
          time: bucket.timestampMs,
          value: Number.isNaN(value) ? 0 : value,
          color: longRatio > 0.5 ? chartPalette.success : chartPalette.danger,
        };
      })
      .filter((p) => !Number.isNaN(p.time));
  }, [chartBuckets, selectedChart]);

  const totals = useMemo(
    () =>
      chartBuckets.reduce(
        (acc, b) => ({ volume: acc.volume + b.totalVolume, count: acc.count + b.liquidationsCount }),
        { volume: 0, count: 0 }
      ),
    [chartBuckets]
  );

  const formatValue = useCallback(
    (v: number) => (selectedChart === "count" ? compactCount(v) : compactUsd(v)),
    [selectedChart]
  );

  const handleCrosshairMove = useCallback((value: number | null, time: number | null) => {
    setHoverValue(value);
    setHoverTime(time);
  }, []);

  const totalValue = selectedChart === "volume" ? totals.volume : totals.count;
  const displayValue = hoverValue ?? totalValue;
  const unit = selectedChart === "count" ? "liquidations · " : "";
  const displayCaption = hoverTime
    ? `${unit}${formatDateTime(new Date(hoverTime), dateFormat)}`
    : `${unit}total over ${chartPeriod}`;

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHead
        title="Liquidation history"
        tag={chartPeriod}
        actions={
          <>
            <PillTabs
              tabs={CHART_TABS}
              activeTab={selectedChart}
              onTabChange={(v) => setSelectedChart(v as LiquidationChartType)}
            />
            <PillTabs
              variant="text"
              tabs={CHART_PERIOD_OPTIONS}
              activeTab={chartPeriod}
              onTabChange={(v) => setChartPeriod(v as HistoricalChartPeriod)}
            />
          </>
        }
      />

      {/* Headline value: hovered bucket, else the window total. */}
      <div className="flex items-baseline gap-2 px-3.5 pt-3">
        <span className="mono text-[20px] font-semibold tracking-[-0.02em] leading-none text-text-primary">
          {chartLoading && !chartHasData ? "…" : formatValue(displayValue)}
        </span>
        <span className="mono text-[10px] text-text-tertiary">{displayCaption}</span>
      </div>

      <div className="px-3 py-3 h-[280px]">
        {error && !chartBuckets.length ? (
          <ChartError message="Failed to load liquidation data" />
        ) : chartLoading ? (
          <ChartLoading />
        ) : chartData.length === 0 || !chartHasData ? (
          <ChartEmpty message="No liquidation history available for this period" />
        ) : (
          <AuroraHistogramChart
            data={chartData}
            defaultColor={chartPalette.danger}
            formatValue={formatValue}
            onCrosshairMove={handleCrosshairMove}
          />
        )}
      </div>
    </Card>
  );
}
