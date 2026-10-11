"use client";

import { memo, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import {
  CardHeading,
  ChartError,
  ChartLoading,
  PeriodSelector,
  chartColors,
  chartPalette,
  rechartsGridDefaults,
} from "@/components/common";
import { SeriesLegend } from "@/components/hype/SeriesLegend";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import { useBuilderGrowth, type GrowthMetric, type GrowthRange } from "@/services/market/builder-growth";
import { resolveBuilderLabel } from "./BuilderIdentity";

/**
 * Daily builder code growth, one stacked bar per UTC day and one band per
 * builder. The leaders over the window get their own colour; the rest of the
 * tracked builders share one muted band so the total stays honest.
 */

const METRICS: readonly GrowthMetric[] = ["fees", "users", "newUsers", "volume"];
const METRIC_LABELS: Record<GrowthMetric, string> = {
  fees: "Revenue",
  users: "Users",
  newUsers: "New users",
  volume: "Volume",
};

const RANGES: readonly GrowthRange[] = ["30d", "90d", "180d", "all"];
const RANGE_LABELS: Record<GrowthRange, string> = { "30d": "30D", "90d": "90D", "180d": "180D", all: "All" };

const OTHERS_KEY = "others";
const SERIES_COLORS = chartPalette.multiSeries;
const TOP_N = SERIES_COLORS.length;

const isUsd = (m: GrowthMetric): boolean => m === "fees" || m === "volume";
const fmt = (m: GrowthMetric, v: number): string =>
  isUsd(m) ? compactUsd(v, { decimals: v >= 1e6 ? 1 : 0, fallback: "$0" }) : compactCount(v);

// UTC on every label: the buckets are UTC days.
const formatDay = (day: string): string =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const formatFullDay = (day: string): string =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

interface SeriesDef {
  key: string;
  label: string;
  color: string;
  total: number;
}

type Point = { day: string } & Record<string, number | string>;

function GrowthTooltip({
  active,
  payload,
  label,
  series,
  metric,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number }[];
  label?: string;
  series: SeriesDef[];
  metric: GrowthMetric;
}) {
  if (!active || !payload?.length || !label) return null;
  const values = new Map(payload.map((p) => [String(p.dataKey), Number(p.value ?? 0)]));
  const rows = series
    .map((s) => ({ ...s, value: values.get(s.key) ?? 0 }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[200px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">{formatFullDay(label)}</div>
      <div className="mt-2 space-y-1">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="text-[11.5px] text-text-primary mono tabular-nums">{fmt(metric, r.value)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 pt-1.5 mt-1 border-t border-border-subtle">
          <span className="text-[11px] text-text-secondary">Total</span>
          <span className="text-[11.5px] font-semibold text-text-primary mono tabular-nums">{fmt(metric, total)}</span>
        </div>
      </div>
    </div>
  );
}

export const BuildersGrowthChart = memo(function BuildersGrowthChart() {
  const [metric, setMetric] = useState<GrowthMetric>("fees");
  const [range, setRange] = useState<GrowthRange>("90d");
  const { data, isLoading, error } = useBuilderGrowth(metric, range);

  const { points, series } = useMemo(() => {
    if (!data || data.metric !== metric || data.range !== range) return { points: [] as Point[], series: [] as SeriesDef[] };
    const leaders = data.builders.slice(0, TOP_N);
    const rest = data.builders.slice(TOP_N);
    const defs: SeriesDef[] = leaders.map((b, i) => ({
      key: b.address,
      label: resolveBuilderLabel(b.address, b.name).label,
      color: SERIES_COLORS[i],
      total: b.total,
    }));
    if (rest.length > 0) {
      defs.push({
        key: OTHERS_KEY,
        label: `${rest.length} other builders`,
        color: chartColors.textMuted,
        total: rest.reduce((sum, b) => sum + b.total, 0),
      });
    }
    const pts: Point[] = data.days.map((day, i) => {
      const p: Point = { day };
      for (const b of leaders) p[b.address] = b.series[i] ?? 0;
      if (rest.length > 0) p[OTHERS_KEY] = rest.reduce((sum, b) => sum + (b.series[i] ?? 0), 0);
      return p;
    });
    return { points: pts, series: defs };
  }, [data, metric, range]);

  const grandTotal = series.reduce((sum, s) => sum + s.total, 0);
  const backfilling = data?.coverage.backfilling ?? 0;
  const isEmpty = !isLoading && !error && series.length === 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading
        icon={<BarChart3 size={13} className="text-brand" />}
        title="Builder growth"
        description="Daily, per builder code, since builder codes went live"
      />

      {/* Controls on their own row: side by side they overflow a phone-width card. */}
      <div className="flex flex-wrap items-center gap-1.5 px-3.5 pt-2.5">
        <PeriodSelector selected={metric} onChange={setMetric} options={METRICS} labels={METRIC_LABELS} variant="aurora" />
        <PeriodSelector selected={range} onChange={setRange} options={RANGES} labels={RANGE_LABELS} variant="aurora" />
      </div>

      <div className="flex-1 px-2 pt-3 pb-2">
        {error && !data ? (
          <ChartError />
        ) : isLoading && series.length === 0 ? (
          <ChartLoading />
        ) : isEmpty ? (
          <div className="h-[280px] grid place-items-center text-[12px] text-text-tertiary">
            History is still loading, check back in a few minutes
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={points} margin={{ top: 6, right: 10, bottom: 0, left: 0 }} barCategoryGap={points.length > 120 ? 0 : 1}>
              <CartesianGrid {...rechartsGridDefaults} />
              <XAxis
                dataKey="day"
                tickFormatter={formatDay}
                tick={{ fill: chartColors.textMuted, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={44}
              />
              <YAxis
                tickFormatter={(v) => fmt(metric, Number(v))}
                tick={{ fill: chartColors.textMuted, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                cursor={{ fill: chartColors.textMuted, fillOpacity: 0.08 }}
                content={<GrowthTooltip series={series} metric={metric} />}
              />
              {series.map((s) => (
                <Bar key={s.key} dataKey={s.key} stackId="growth" fill={s.color} isAnimationActive={false} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <SeriesLegend
        items={series.map((s) => ({
          key: s.key,
          label: s.label,
          color: s.color,
          shape: "bar" as const,
          value:
            metric === "users"
              ? undefined
              : grandTotal > 0
                ? `${fmt(metric, s.total)} · ${((s.total / grandTotal) * 100).toFixed(0)}%`
                : undefined,
        }))}
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: Hyperliquid builder fill files, one per builder and per UTC day</span>
        {data?.coverage.lastDay && (
          <>
            <span className="opacity-50">·</span>
            <span>Last day {formatFullDay(data.coverage.lastDay)}</span>
          </>
        )}
        <span className="opacity-50">·</span>
        <span>
          {metric === "users" || metric === "newUsers"
            ? "A trader using two apps counts once in each."
            : `${data?.coverage.tracked ?? "…"} builders tracked: past and current leaders.`}
        </span>
        {backfilling > 0 && (
          <>
            <span className="opacity-50">·</span>
            <span className="text-gold">History still loading for {backfilling} builders</span>
          </>
        )}
      </div>
    </Card>
  );
});
