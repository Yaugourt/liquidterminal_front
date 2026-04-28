"use client";

import { useMemo } from "react";
import { useOverviewDailyVolume10d } from "@/services/indexer/overview";
import { AuroraAreaChart, type ChartDataPoint } from "@/components/common/charts/AuroraAreaChart";
import { chartColors } from "@/components/common/charts/chartTheme";

function formatVolumeUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function parseDateToMs(dateStr: string): number {
  // dateStr expected format: "YYYY-MM-DD"
  const ts = Date.parse(dateStr);
  return Number.isFinite(ts) ? ts : 0;
}

export function ExplorerVolumeChart() {
  const { data, isLoading } = useOverviewDailyVolume10d();

  const chartData = useMemo((): ChartDataPoint[] =>
    data
      .map((entry) => ({
        time: parseDateToMs(entry.date),
        value: entry.volume ?? 0,
      }))
      .filter((p) => p.time > 0),
    [data]
  );

  return (
    <div className="p-4 h-full flex flex-col min-h-[280px]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Trading Volume</h3>
        <p className="text-xs text-text-secondary mt-0.5">10-day daily volume</p>
      </div>
      {isLoading && chartData.length === 0 ? (
        <div className="flex-1 bg-white/5 animate-pulse rounded-xl" />
      ) : (
        <div className="flex-1">
          <AuroraAreaChart
            data={chartData}
            lineColor={chartColors.cyan}
            formatValue={formatVolumeUSD}
            showGrid
            yAxisWidth={70}
          />
        </div>
      )}
    </div>
  );
}
