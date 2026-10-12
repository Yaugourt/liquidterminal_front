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
 * Daily builder code growth, one stacked bar per UTC day. "By builder" gives
 * the leaders over the window their own colour and sums every other builder
 * into one muted band; "Total" draws the sum of all builders as one series.
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

type View = "builders" | "total";
const VIEWS: readonly View[] = ["builders", "total"];
const VIEW_LABELS: Record<View, string> = { builders: "By builder", total: "Total" };

const OTHERS_KEY = "others";
const TOTAL_KEY = "total";
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
  const [view, setView] = useState<View>("builders");
  const { data, isLoading, error } = useBuilderGrowth(metric, range);

  const { points, series } = useMemo(() => {
    if (!data || data.metric !== metric || data.range !== range) return { points: [] as Point[], series: [] as SeriesDef[] };
    if (view === "total") {
      const sum = data.total.reduce((acc, v) => acc + v, 0);
      if (sum <= 0) return { points: [] as Point[], series: [] as SeriesDef[] };
      return {
        points: data.days.map((day, i) => ({ day, [TOTAL_KEY]: data.total[i] ?? 0 })),
        series: [{ key: TOTAL_KEY, label: `All builders (${data.coverage.active})`, color: chartPalette.accent, total: sum }],
      };
    }
    // The API returns a few more leaders than we have colours: fold the extra
    // ones into the "others" band with every remaining builder.
    const leaders = data.builders.slice(0, TOP_N);
    const folded = data.builders.slice(TOP_N);
    const othersCount = folded.length + (data.others?.count ?? 0);
    const othersSeries = data.days.map(
      (_, i) => (data.others?.series[i] ?? 0) + folded.reduce((acc, b) => acc + (b.series[i] ?? 0), 0)
    );
    const defs: SeriesDef[] = leaders.map((b, i) => ({
      key: b.address,
      label: resolveBuilderLabel(b.address, b.name).label,
      color: SERIES_COLORS[i],
      total: b.total,
    }));
    if (othersCount > 0) {
      defs.push({
        key: OTHERS_KEY,
        label: `${othersCount} other builders`,
        color: chartColors.textMuted,
        total: othersSeries.reduce((acc, v) => acc + v, 0),
      });
    }
    const pts: Point[] = data.days.map((day, i) => {
      const p: Point = { day };
      for (const b of leaders) p[b.address] = b.series[i] ?? 0;
      if (othersCount > 0) p[OTHERS_KEY] = othersSeries[i];
      return p;
    });
    return { points: pts, series: defs };
  }, [data, metric, range, view]);

  const grandTotal = series.reduce((sum, s) => sum + s.total, 0);
  const share = data?.coverage.volumeShare30d ?? null;
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
        <PeriodSelector selected={view} onChange={setView} options={VIEWS} labels={VIEW_LABELS} variant="aurora" />
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
              : view === "total"
                ? `${fmt(metric, s.total)} over the window`
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
            ? "Counted per builder: a trader using two apps counts once in each."
            : `${data?.coverage.tracked ?? "…"} builders tracked, every one seen active since launch.`}
        </span>
        {share != null && backfilling === 0 && (
          <>
            <span className="opacity-50">·</span>
            <span>
              {`${(share * 100).toFixed(0)}% of all builder-code volume over 30 days, against HypeDexer global stats.`}
            </span>
          </>
        )}
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
