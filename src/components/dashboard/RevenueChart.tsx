"use client";

import { memo, useId, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, ChartLine, BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AuroraAreaChart,
  FlowBar,
  FlowGrid,
  chartPalette,
  type FlowGridColumn,
} from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { RevenueDay } from "@/services/market/revenue";

type ChartType = "area" | "bar";

/**
 * RevenueChart — Twin Heroes V2: pure vertical stack.
 *
 * 5 strates aligned with sibling `StablecoinsCard` so hairlines match
 * pixel-perfect when the two cards are placed side by side in a 2-col grid.
 *
 *   1. KPI strip      — Last 24h / Window total + Δ / Avg / Day  (3-cell, gap-px)
 *   2. Chart          — AuroraAreaChart of total daily revenue (gold)
 *   3. Source         — FlowGrid + FlowBar, 5 sources sorted by share
 *
 * No nested containers. Hairlines (`border-b border-border-subtle`) only.
 */

const REVENUE_SERIES = [
  { key: "perp", label: "Perp", color: chartPalette.multiSeries[0] },
  { key: "spot", label: "Spot", color: chartPalette.gold },
  { key: "auction", label: "Auctions", color: chartPalette.multiSeries[3] },
  { key: "priority", label: "Priority", color: chartPalette.multiSeries[4] },
  { key: "hip4", label: "HIP-4", color: chartPalette.multiSeries[6] },
] as const;

type SeriesKey = (typeof REVENUE_SERIES)[number]["key"];

/** Enrich a backend RevenueDay with the merged `auction = hip1 + hip3` field.
 * Both are slot-pricing Dutch auctions (HIP-1 = spot listings, HIP-3 = perp
 * DEX deployments), conceptually the same revenue mechanism. */
interface EnrichedRevenueDay extends RevenueDay {
  auction: number;
}
function enrichDay(d: RevenueDay): EnrichedRevenueDay {
  return { ...d, auction: (d.hip1 ?? 0) + (d.hip3 ?? 0) };
}

interface RevenueChartProps {
  days: RevenueDay[];
  height?: number;
}

const formatUsdCompact = (v: number): string => (v === 0 ? "—" : compactUsd(v));

/** Tighter compact USD for Y axis labels — `$48M` instead of `$48.00M`.
 * Used only on chart axes where horizontal space is tight; tooltips and KPIs
 * keep `formatUsdCompact` for precision. */
const formatUsdAxis = (v: number): string =>
  v >= 1e9 ? compactUsd(v, { decimals: 1 }) : compactUsd(v, { decimals: 0, fallback: "$0" });

const formatTickDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const RevenueChartComponent = ({ days, height = 220 }: RevenueChartProps) => {
  const [chartType, setChartType] = useState<ChartType>("bar");

  const auroraData = useMemo(
    () =>
      days.map((d) => ({
        time: Date.parse(`${d.date}T00:00:00Z`),
        value: d.total,
      })),
    [days],
  );

  /** Last 24h KPI = last fully-completed UTC day (skip today partial). */
  const last24hTotal = useMemo(() => {
    if (days.length === 0) return 0;
    const todayUtc = new Date().toISOString().slice(0, 10);
    const last = days[days.length - 1];
    if (last.date === todayUtc && days.length >= 2) {
      return days[days.length - 2].total;
    }
    return last.total;
  }, [days]);

  const windowTotal = useMemo(
    () => days.reduce((acc, d) => acc + d.total, 0),
    [days],
  );

  const avgDay = useMemo(
    () => (days.length === 0 ? 0 : windowTotal / days.length),
    [days, windowTotal],
  );

  /** Delta: avg of the most-recent third vs the middle third. */
  const delta = useMemo(() => {
    if (days.length < 9) return null;
    const len = days.length;
    const recent = days.slice(-Math.floor(len / 3));
    const prior = days.slice(
      -Math.floor((2 * len) / 3),
      -Math.floor(len / 3),
    );
    const avg = (arr: RevenueDay[]) =>
      arr.reduce((a, d) => a + d.total, 0) / Math.max(1, arr.length);
    const r = avg(recent);
    const p = avg(prior);
    if (p === 0) return null;
    return ((r - p) / p) * 100;
  }, [days]);

  const sourceRows = useMemo(() => {
    const sums = REVENUE_SERIES.reduce(
      (acc, s) => ({ ...acc, [s.key]: 0 }),
      {} as Record<SeriesKey, number>,
    );
    let total = 0;
    for (const d of days) {
      const e = enrichDay(d);
      for (const s of REVENUE_SERIES) {
        sums[s.key] += e[s.key];
      }
      total += e.total;
    }
    return REVENUE_SERIES.map((s) => ({
      key: s.key,
      label: s.label,
      color: s.color,
      value: sums[s.key],
      pct: total > 0 ? (sums[s.key] / total) * 100 : 0,
    })).filter((r) => r.value > 0);
  }, [days]);

  return (
    <div className="flex flex-col flex-1">
      <KpiStrip
        last24h={last24hTotal}
        windowTotal={windowTotal}
        avgDay={avgDay}
        delta={delta}
      />

      <div className="px-3.5 pt-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-1 h-[14px]">
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            {chartType === "bar"
              ? `${barLabel(pickBarGranularity(days.length))} revenue · ${days.length}d`
              : `Daily revenue · ${days.length}d`}
          </span>
          <div className="flex items-center gap-0.5">
            <ChartTypeButton
              active={chartType === "area"}
              onClick={() => setChartType("area")}
              Icon={ChartLine}
              label="Area"
            />
            <ChartTypeButton
              active={chartType === "bar"}
              onClick={() => setChartType("bar")}
              Icon={BarChart3}
              label="Bars"
            />
          </div>
        </div>
        <div style={{ height }}>
          {chartType === "area" ? (
            <AuroraAreaChart
              data={auroraData}
              lineColor={chartPalette.gold}
              height={height}
              yAxisWidth={48}
              formatValue={formatUsdCompact}
              formatTime={formatTickDate}
            />
          ) : (
            <RevenueStackedBars
              days={days}
              height={height}
            />
          )}
        </div>
      </div>

      <SourceBreakdown rows={sourceRows} />
    </div>
  );
};

export const RevenueChart = memo(RevenueChartComponent);

// ─────────────────────────────────────────────────────────────────────────────
// Stacked bars — 1 bar per day, 6 stacked segments (1 per revenue source)
// ─────────────────────────────────────────────────────────────────────────────

interface StackedRow {
  time: number;
  perp: number;
  spot: number;
  auction: number;
  priority: number;
  hip4: number;
  total: number;
}

type BarGranularity = "day" | "week" | "month";

function barLabel(g: BarGranularity): string {
  if (g === "day") return "Daily";
  if (g === "week") return "Weekly";
  return "Monthly";
}

/** Pick the right bucketing depth so bars stay visible at ~590px card width.
 * 7D / 30D = daily (≤35 bars), 90D = weekly (~13), 1Y / All = monthly. */
function pickBarGranularity(nDays: number): BarGranularity {
  if (nDays <= 35) return "day";
  if (nDays <= 100) return "week";
  return "month";
}

/** Aggregate consecutive rows into UTC week or month buckets, summing all
 * flow fields. Flows are additive across days so summing is the correct
 * aggregator. */
function bucketRevenueRows(rows: StackedRow[], g: BarGranularity): StackedRow[] {
  if (g === "day") return rows;
  const keyFn = g === "week" ? weekStartUtc : monthStartUtc;
  const buckets = new Map<number, StackedRow>();
  for (const r of rows) {
    const k = keyFn(r.time);
    const prev = buckets.get(k);
    if (prev) {
      prev.perp += r.perp;
      prev.spot += r.spot;
      prev.auction += r.auction;
      prev.priority += r.priority;
      prev.hip4 += r.hip4;
      prev.total += r.total;
    } else {
      buckets.set(k, { ...r, time: k });
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
}

function weekStartUtc(ts: number): number {
  const d = new Date(ts);
  const dow = (d.getUTCDay() + 6) % 7;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow);
}
function monthStartUtc(ts: number): number {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

const RevenueStackedBars = memo(function RevenueStackedBars({
  days,
  height,
}: {
  days: RevenueDay[];
  height: number;
}) {
  const uid = useId().replace(/:/g, "");

  const granularity = useMemo(() => pickBarGranularity(days.length), [days.length]);

  const data: StackedRow[] = useMemo(() => {
    const daily = days.map((d) => {
      const e = enrichDay(d);
      return {
        time: Date.parse(`${d.date}T00:00:00Z`),
        perp: e.perp,
        spot: e.spot,
        auction: e.auction,
        priority: e.priority,
        hip4: e.hip4,
        total: e.total,
      };
    });
    return bucketRevenueRows(daily, granularity);
  }, [days, granularity]);

  /** Index of the topmost source with a non-zero value for each row — used to
   * apply the rounded top-corner radius only to the actual visible top
   * segment (instead of rounding every internal segment). */
  const topByRow = useMemo(() => {
    return data.map((row) => {
      for (let i = REVENUE_SERIES.length - 1; i >= 0; i--) {
        const k = REVENUE_SERIES[i].key as keyof StackedRow;
        if ((row[k] as number) > 0) return i;
      }
      return -1;
    });
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        barCategoryGap={3}
        barGap={0}
        maxBarSize={32}
      >
        <defs>
          {REVENUE_SERIES.map((s) => (
            <linearGradient
              key={s.key}
              id={`rev-bar-grad-${uid}-${s.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.5} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="3 5"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="time"
          type="number"
          domain={["dataMin", "dataMax"]}
          scale="time"
          padding={{ left: 20, right: 20 }}
          tickFormatter={formatTickDate}
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          minTickGap={48}
        />
        <YAxis
          tickFormatter={(v) => formatUsdAxis(Number(v))}
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.06)" }}
          content={<StackedBarsTooltip />}
        />
        {REVENUE_SERIES.map((s, seriesIdx) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            stackId="rev"
            fill={`url(#rev-bar-grad-${uid}-${s.key})`}
            stroke={s.color}
            strokeWidth={0.5}
            strokeOpacity={0.4}
            isAnimationActive={false}
            shape={(props: unknown) => (
              <StackedBarSegment
                {...(props as StackedBarSegmentProps)}
                isTop={topByRow[(props as StackedBarSegmentProps).index] === seriesIdx}
              />
            )}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
});

/** Custom segment shape: rounds the top corners only when this segment is the
 * top of the stack for its row. SVG `<path>` is the fastest cross-browser
 * way to draw a rectangle with selective rounded corners. */
interface StackedBarSegmentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  index: number;
  isTop: boolean;
}

function StackedBarSegment({
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  strokeOpacity,
  isTop,
}: StackedBarSegmentProps) {
  if (!Number.isFinite(width) || width <= 0 || height <= 0) return null;
  const r = isTop ? Math.min(3, width / 2, height / 2) : 0;
  // Path: start top-left (with arc) → top-right → bottom-right → bottom-left → close.
  const d =
    r > 0
      ? `M ${x},${y + r} Q ${x},${y} ${x + r},${y} L ${x + width - r},${y} Q ${x + width},${y} ${x + width},${y + r} L ${x + width},${y + height} L ${x},${y + height} Z`
      : `M ${x},${y} L ${x + width},${y} L ${x + width},${y + height} L ${x},${y + height} Z`;
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
    />
  );
}

interface StackedTooltipProps {
  active?: boolean;
  payload?: { payload: StackedRow }[];
}

function StackedBarsTooltip({ active, payload }: StackedTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  const rows = REVENUE_SERIES.map((s) => ({
    ...s,
    value: row[s.key as keyof StackedRow] as number,
  })).filter((r) => r.value > 0);

  return (
    <div
      className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40"
      style={{ minWidth: 220 }}
    >
      <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
        {new Date(row.time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <div className="mono text-[14px] font-bold text-text-primary mt-0.5">
        {formatUsdCompact(row.total)}
      </div>
      <div className="mt-1.5 space-y-0.5">
        {rows.length === 0 ? (
          <div className="text-[11px] text-text-tertiary">No revenue</div>
        ) : (
          rows.map((r) => (
            <div key={r.key} className="flex items-center gap-2 text-[11px]">
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{
                  background: r.color,
                  boxShadow: `0 0 8px ${r.color}88`,
                }}
              />
              <span className="text-text-secondary flex-1">{r.label}</span>
              <span className="mono font-semibold text-text-primary">
                {formatUsdCompact(r.value)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Tiny icon-button to switch the chart between area and bar.
 * Active variant uses `text-text-primary`; inactive uses `text-text-tertiary`
 * so it stays discreet next to the chart label.
 */
function ChartTypeButton({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${label} chart`}
      title={label}
      className={`p-1 rounded transition-colors hover:bg-surface-2 ${
        active ? "text-text-primary" : "text-text-tertiary"
      }`}
    >
      <Icon size={11} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI strip — 3 hairline-separated cells (gap-px on bg-border-subtle)
// ─────────────────────────────────────────────────────────────────────────────

const KpiStrip = memo(function KpiStrip({
  last24h,
  windowTotal,
  avgDay,
  delta,
}: {
  last24h: number;
  windowTotal: number;
  avgDay: number;
  delta: number | null;
}) {
  const deltaPositive = (delta ?? 0) >= 0;
  return (
    <div className="grid grid-cols-3 gap-px bg-border-subtle border-b border-border-subtle">
      <MiniKpi label="Last 24h" value={formatUsdCompact(last24h)} />
      <MiniKpi
        label="Window"
        value={formatUsdCompact(windowTotal)}
        valueTone="gold"
        delta={
          delta === null
            ? undefined
            : `${deltaPositive ? "+" : "−"}${Math.abs(delta).toFixed(1)}%`
        }
        deltaTone={deltaPositive ? "success" : "danger"}
      />
      <MiniKpi label="Avg / Day" value={formatUsdCompact(avgDay)} />
    </div>
  );
});

function MiniKpi({
  label,
  value,
  delta,
  valueTone,
  deltaTone,
}: {
  label: string;
  value: string;
  delta?: string;
  valueTone?: "default" | "gold";
  deltaTone?: "default" | "success" | "danger";
}) {
  const valueColor = valueTone === "gold" ? "text-gold" : "text-text-primary";
  const deltaColor =
    deltaTone === "success"
      ? "text-success"
      : deltaTone === "danger"
      ? "text-danger"
      : "text-text-tertiary";
  return (
    <div className="bg-surface px-3.5 py-2 flex items-baseline gap-2 min-w-0">
      <span className="text-[9.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold truncate">
        {label}
      </span>
      <span className={`mono text-[13px] font-semibold ml-auto ${valueColor}`}>
        {value}
      </span>
      {delta && (
        <span
          className={`text-[10px] font-semibold flex items-center gap-0.5 ${deltaColor}`}
        >
          {deltaTone === "success" ? (
            <TrendingUp size={10} />
          ) : deltaTone === "danger" ? (
            <TrendingDown size={10} />
          ) : null}
          {delta}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Source breakdown — full-width FlowGrid + FlowBar gradient
// ─────────────────────────────────────────────────────────────────────────────

interface SourceRow {
  key: SeriesKey;
  label: string;
  color: string;
  value: number;
  pct: number;
}

const SourceBreakdown = memo(function SourceBreakdown({
  rows,
}: {
  rows: SourceRow[];
}) {
  const maxPct = Math.max(...rows.map((r) => r.pct), 1);

  const columns: FlowGridColumn<SourceRow>[] = [
    {
      header: "Source",
      width: 56,
      align: "left",
      render: (r) => (
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-text-primary">
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: r.color }}
          />
          {r.label}
        </div>
      ),
    },
    {
      header: "Share",
      width: "1fr",
      align: "left",
      render: (r) => (
        <FlowBar ratio={r.pct / maxPct} color={r.color} variant="gradient" />
      ),
    },
    {
      header: "USD",
      width: 80,
      align: "right",
      render: (r) => (
        <span className="mono text-[10.5px] font-semibold text-text-primary">
          {r.value > 0 ? formatUsdCompact(r.value) : "—"}
        </span>
      ),
    },
    {
      header: "%",
      width: 36,
      align: "right",
      render: (r) => (
        <span className="mono text-[10.5px] text-text-tertiary">
          {r.pct > 0.1 ? `${r.pct.toFixed(r.pct < 1 ? 1 : 0)}%` : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="px-3.5 py-3 flex-1 flex flex-col">
      <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-2 h-[14px]">
        Source breakdown
      </div>
      <FlowGrid
        rows={rows}
        rowKey={(r) => r.key}
        columns={columns}
        containerDelay={0.15}
        rowStagger={0.04}
        rowGap={4}
      />
    </div>
  );
});
