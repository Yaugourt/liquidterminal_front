"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  KpiRibbon,
  AuroraAreaChart,
  ChartSkeleton,
  chartPalette,
  type KpiCell,
} from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useDailyVolume } from "@/services/market/market-volume";

/** Midnight-UTC epoch for a `YYYY-MM-DD` day, so the x-axis ignores local tz. */
function dayToTime(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function fmtDay(date: string): string {
  return new Date(dayToTime(date)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Market-wide traded volume per day over the trailing window.
 *
 * The current UTC day is still accumulating, so it is charted separately as a
 * "today so far" figure rather than plotted as a full bar that would read as a
 * volume collapse. The trend line covers complete days only.
 */
export function MarketVolumeCard() {
  const { days, isLoading, error } = useDailyVolume();

  const model = useMemo(() => {
    if (days.length === 0) return null;
    const todayUtc = new Date().toISOString().slice(0, 10);

    const partial = days.find((d) => d.date === todayUtc) ?? null;
    const complete = days.filter((d) => d.date !== todayUtc);
    if (complete.length === 0) return null;

    const chartData = complete
      .map((d) => ({ time: dayToTime(d.date), value: d.volume }))
      .filter((p) => Number.isFinite(p.time));

    const total = complete.reduce((s, d) => s + d.volume, 0);
    const avg = total / complete.length;
    const latest = complete[complete.length - 1];

    return { chartData, total, avg, latest, partial, spanDays: complete.length };
  }, [days]);

  if (isLoading && days.length === 0) {
    return (
      <Card className="flex flex-col overflow-hidden">
        <div className="p-3 h-[300px]">
          <ChartSkeleton minHeight="min-h-[260px]" />
        </div>
      </Card>
    );
  }
  if (error || !model) return null;

  const cells: KpiCell[] = [
    {
      key: "total",
      label: "Cumulative volume",
      value: compactUsd(model.total),
      sub: `last ${model.spanDays}d`,
    },
    { key: "avg", label: "Daily average", value: compactUsd(model.avg) },
    {
      key: "latest",
      label: "Latest full day",
      value: compactUsd(model.latest.volume),
      sub: fmtDay(model.latest.date),
    },
    ...(model.partial
      ? [
          {
            key: "today",
            label: "Today so far",
            value: compactUsd(model.partial.volume),
            sub: "in progress",
            tone: "gold" as const,
          },
        ]
      : []),
  ];

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <BarChart3 size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Market volume</h3>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          daily · complete days
        </span>
      </div>

      <KpiRibbon cells={cells} />

      <div className="border-t border-border-subtle p-3 h-[260px]">
        <AuroraAreaChart
          data={model.chartData}
          height={230}
          lineColor={chartPalette.accent}
          formatValue={(v) => compactUsd(v)}
          formatTime={(t) =>
            new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
          }
        />
      </div>
    </Card>
  );
}
