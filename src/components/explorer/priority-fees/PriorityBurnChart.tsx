"use client";

import { memo, useMemo, useState } from "react";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AuroraHistogramChart, ChartEmpty, ChartError, ChartLoading, chartPalette } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { compactCount, compactHype, compactUsd } from "@/lib/formatters/numberFormatting";
import type { PriorityFeesSeries, PriorityFeesSeriesWindow } from "@/services/explorer/priority-fees";
import { bucketSpanHours, hypeToUsd } from "./priority-fees-format";

type Metric = "gas" | "fills";

const METRIC_TABS = [
  { value: "gas", label: "HYPE" },
  { value: "fills", label: "Fills" },
];

/**
 * Buckets are sampled, not published, so their spans vary by a few tenths of an
 * hour. Bars of equal width would misstate that; plotting a per-hour rate is
 * width-invariant and makes 24H and 7D directly comparable, which raw totals
 * over 1 h and 6 h buckets are not.
 */
function toRatePoints(series: PriorityFeesSeries | null, metric: Metric) {
  if (!series) return [];
  return series.buckets.map((bucket) => ({
    time: bucket.start,
    value: (metric === "gas" ? bucket.gas : bucket.fills) / bucketSpanHours(bucket),
  }));
}

export interface PriorityBurnChartProps {
  series: PriorityFeesSeries | null;
  window: PriorityFeesSeriesWindow;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Priority gas burned over time, rebuilt from cumulative rollups.
 *
 * The upstream publishes a pre-aggregated daily chart, but it stopped advancing
 * on 2026-07-11 while still answering, so a line drawn from it would read as a
 * protocol that stopped earning rather than as a feed that stopped reporting.
 * This series is differenced out of the rollup that is still computed live.
 */
export const PriorityBurnChart = memo(function PriorityBurnChart({
  series,
  window,
  isLoading,
  error,
}: PriorityBurnChartProps) {
  const [metric, setMetric] = useState<Metric>("gas");

  const points = useMemo(() => toRatePoints(series, metric), [series, metric]);
  const hypeUsd = series?.meta.hypeUsd ?? null;

  const formatValue = (value: number): string => {
    if (metric === "fills") return `${compactCount(value)}/h`;
    const usd = hypeToUsd(value, hypeUsd);
    return usd === null ? `${compactHype(value)} HYPE/h` : `${compactHype(value)} HYPE/h · ${compactUsd(usd)}`;
  };

  const formatTime = (ms: number): string =>
    new Date(ms).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Flame size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Burn rate</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          {window === "24h" ? "hourly" : "6h buckets"}
        </span>
        <PillTabs
          tabs={METRIC_TABS}
          activeTab={metric}
          onTabChange={(v) => setMetric(v as Metric)}
          className="ml-auto"
        />
      </div>

      <div className="flex-1 min-h-[280px] flex flex-col p-3.5">
        {error ? (
          <div className="flex-1 flex items-center justify-center">
            <ChartError />
          </div>
        ) : isLoading && points.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <ChartLoading />
          </div>
        ) : points.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <ChartEmpty suggestion="The upstream rollup returned nothing for this window" />
          </div>
        ) : (
          <div className="h-[260px]">
            <AuroraHistogramChart
              data={points}
              defaultColor={chartPalette.gold}
              formatValue={formatValue}
              formatTime={formatTime}
              yAxisWidth={56}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: HypeDexer rollups, differenced per bucket</span>
        <span className="opacity-50">·</span>
        <span>Times UTC</span>
        <span className="opacity-50">·</span>
        <span>7 days is the widest window upstream serves</span>
        {series && series.meta.missingBuckets > 0 && (
          <>
            <span className="opacity-50">·</span>
            <span className="text-warning">
              {series.meta.missingBuckets} bucket{series.meta.missingBuckets > 1 ? "s" : ""} unanswered
            </span>
          </>
        )}
      </div>
    </Card>
  );
});
