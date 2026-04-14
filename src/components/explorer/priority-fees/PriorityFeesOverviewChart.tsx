"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LightweightChart } from "@/components/common/charts/LightweightChart";
import type { PriorityFeesStats, PriorityFeesChartMetric } from "@/services/explorer/priority-fees";
import { statsToChartPoints } from "./priority-fees-chart-series";

const HOUR_OPTIONS = [1, 6, 24, 72, 168] as const;

export interface PriorityFeesOverviewChartProps {
  hours: number;
  onHoursChange: (h: number) => void;
  stats: PriorityFeesStats | null;
  isLoading: boolean;
  error: Error | null;
}

export function PriorityFeesOverviewChart({
  hours,
  onHoursChange,
  stats,
  isLoading,
  error,
}: PriorityFeesOverviewChartProps) {
  const [metric, setMetric] = useState<PriorityFeesChartMetric>("total_gas");

  const chartData = useMemo(() => statsToChartPoints(stats, metric), [stats, metric]);

  const formatValue = useMemo(
    () => (v: number) =>
      metric === "fill_count"
        ? v.toLocaleString("en-US", { maximumFractionDigits: 0 })
        : v.toLocaleString("en-US", { maximumFractionDigits: 2 }),
    [metric]
  );

  return (
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-outfit text-lg font-semibold text-white tracking-tight">
            Priority fees overview
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Windowed indexer stats; chart uses hourly buckets when the API returns them.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg p-1 border border-border-subtle bg-brand-primary/60">
            {(["total_gas", "fill_count"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  metric === m
                    ? "bg-brand-accent text-brand-tertiary"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {m === "total_gas" ? "Gas" : "Fills"}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg p-1 border border-border-subtle bg-brand-primary/60">
            {HOUR_OPTIONS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onHoursChange(h)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  hours === h
                    ? "bg-brand-accent text-brand-tertiary"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          {error.message}
        </div>
      )}

      <div className="mt-6 relative min-h-[280px] w-full">
        {isLoading && !stats ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center glass-panel rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-brand-accent mb-2" />
            <span className="text-text-muted text-sm">Loading chart…</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center rounded-xl border border-border-subtle bg-brand-primary/30 text-center px-4">
            <p className="text-sm text-text-secondary">
              No hourly buckets in this response for the chart. If totals above show numbers, the
              indexer returned aggregates only; otherwise check the API response shape.
            </p>
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <LightweightChart data={chartData} height={280} formatValue={formatValue} />
          </div>
        )}
      </div>
    </Card>
  );
}
