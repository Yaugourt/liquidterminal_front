"use client";

import { Fragment, memo, useId, useMemo, useState } from "react";
import { Wallet, ChartLine, BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useSpotStablecoins } from "@/services/market/stablecoins";
import {
  AuroraAreaChart,
  KpiRibbon,
  TokenAvatar,
  chartPalette,
} from "@/components/common";
import { compactCount, compactUsd, fullUsd } from "@/lib/formatters/numberFormatting";
import type { StablecoinSupplyByCoinPoint } from "@/services/market/stablecoins";

type ChartType = "area" | "bar";

const STABLE_SERIES = [
  { key: "USDC", color: chartPalette.accent },
  { key: "USDH", color: chartPalette.gold },
  { key: "USDT0", color: chartPalette.violet },
  { key: "USDE", color: chartPalette.multiSeries[5] },
] as const;
type StableKey = (typeof STABLE_SERIES)[number]["key"];

/** Local window enum — mirrors `RevenueWindow` but the supply data comes from
 * a different source (`/spotUSDC`) so we keep the type separate to avoid
 * coupling the two cards' selectors. */
type SupplyWindow = "7d" | "30d" | "90d" | "1y" | "all";
const SUPPLY_WINDOWS: readonly SupplyWindow[] = ["7d", "30d"] as const;
const SUPPLY_WINDOW_LABELS: Record<SupplyWindow, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  "1y": "1Y",
  all: "All",
};
const SUPPLY_WINDOW_DAYS: Record<Exclude<SupplyWindow, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

/**
 * StablecoinsCard — Twin Heroes V2.
 *
 * Pure vertical stack mirroring `FeesRevenuePanel` strates so both cards
 * share the same hairline rhythm when placed in a side-by-side 2-col grid:
 *
 *   1. card-head        — Wallet icon · "Stablecoins" · "spot supply" pill
 *   2. KPI strip 3-cell — Total supply · Holders · 24h Δ
 *   3. Chart strate     — "Supply trajectory · Npts" + Sparkline (~120px)
 *   4. Holdings list    — TokenAvatar + symbol + holders + supply + % per row
 *   5. footer caveats   — source + refresh cadence
 */

const fmtUsdFull = (v: number): string => (v === 0 ? "—" : fullUsd(v));

const fmtUsdCompact = (v: number): string => (v === 0 ? "—" : compactUsd(v));

/** Tighter compact USD for Y axis labels — `$4.2B` / `$420M`. */
const fmtUsdAxis = (v: number): string =>
  v >= 1e9 ? compactUsd(v, { decimals: 1 }) : compactUsd(v, { decimals: 0, fallback: "$0" });

const fmtCount = (n: number): string => (n <= 0 ? "—" : compactCount(n));

const fmtTickDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const StablecoinsCard = memo(function StablecoinsCard() {
  const [window, setWindow] = useState<SupplyWindow>("30d");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const { stablecoins, supplyChart, supplyByCoinChart, isLoading } = useSpotStablecoins();

  const totalSupply = useMemo(
    () => stablecoins.reduce((acc, s) => acc + s.supply, 0),
    [stablecoins],
  );
  const totalHolders = useMemo(
    () => stablecoins.reduce((acc, s) => acc + s.holders, 0),
    [stablecoins],
  );
  const totalSupplyPct = totalSupply > 0 ? totalSupply : 1;

  /** Window-filtered supply series with timestamps — fed into AuroraAreaChart. */
  const windowedChart = useMemo(() => {
    if (supplyChart.length === 0) return [];
    if (window === "all") return supplyChart;
    const days = SUPPLY_WINDOW_DAYS[window];
    const cutoff = Date.now() - days * 86_400_000;
    return supplyChart.filter((p) => p.time >= cutoff);
  }, [supplyChart, window]);

  /** Window-filtered per-coin series — fed into the stacked bar chart. */
  const windowedByCoinChart = useMemo(() => {
    if (supplyByCoinChart.length === 0) return [];
    if (window === "all") return supplyByCoinChart;
    const days = SUPPLY_WINDOW_DAYS[window];
    const cutoff = Date.now() - days * 86_400_000;
    return supplyByCoinChart.filter((p) => p.time >= cutoff);
  }, [supplyByCoinChart, window]);

  /** Delta over the selected window — first vs last point. */
  const windowDelta = useMemo(() => {
    if (windowedChart.length < 2) return null;
    const first = windowedChart[0].value;
    const last = windowedChart[windowedChart.length - 1].value;
    if (first === 0) return null;
    return ((last - first) / first) * 100;
  }, [windowedChart]);

  const hasData = stablecoins.length > 0;
  const deltaPositive = (windowDelta ?? 0) >= 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* 1. card-head — same min-h as FeesRevenuePanel for hairline alignment. */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Wallet size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Stablecoins
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          spot supply
        </span>
        <div className="ml-auto flex items-center gap-1 text-[11px] font-semibold">
          {SUPPLY_WINDOWS.map((w, i) => (
            <Fragment key={w}>
              {i > 0 && <span className="text-text-tertiary/40">·</span>}
              <button
                type="button"
                onClick={() => setWindow(w)}
                className={`px-1 py-0.5 transition-colors hover:text-text-primary ${
                  w === window ? "text-text-primary" : "text-text-tertiary"
                }`}
              >
                {SUPPLY_WINDOW_LABELS[w]}
              </button>
            </Fragment>
          ))}
        </div>
      </div>

      {/* 2. KPI strip — 3 cells (mirror Fees) */}
      <KpiRibbon
        bordered={false}
        columns="grid-cols-3"
        className="border-b border-border-subtle"
        cells={[
          {
            label: "Total supply",
            value: hasData ? fmtUsdCompact(totalSupply) : isLoading ? "…" : "—",
            tone: "gold",
          },
          {
            label: "Holders",
            value: hasData ? fmtCount(totalHolders) : "—",
          },
          {
            label: `Δ ${SUPPLY_WINDOW_LABELS[window]}`,
            value:
              windowDelta === null
                ? "—"
                : `${deltaPositive ? "+" : "−"}${Math.abs(windowDelta).toFixed(2)}%`,
            tone:
              windowDelta === null
                ? "default"
                : deltaPositive
                ? "success"
                : "danger",
          },
        ]}
      />

      {/* 3. Chart strate — sparkline at hero size, matches Fees chart strate height */}
      <div className="px-3.5 pt-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-1 h-[14px]">
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Supply trajectory · {SUPPLY_WINDOW_LABELS[window]}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] text-text-tertiary/70 mono">
              {(chartType === "bar" ? windowedByCoinChart : windowedChart).length} pts
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
        </div>
        <div style={{ height: 220 }}>
          {chartType === "area" && windowedChart.length >= 2 ? (
            <AuroraAreaChart
              data={windowedChart}
              lineColor={chartPalette.accent}
              height={220}
              yAxisWidth={56}
              formatValue={fmtUsdAxis}
              formatTime={fmtTickDate}
            />
          ) : chartType === "bar" && windowedByCoinChart.length >= 2 ? (
            <StablesStackedBars data={windowedByCoinChart} height={220} />
          ) : (
            <div className="h-full flex items-center justify-center text-[11px] text-text-tertiary">
              {isLoading ? "Loading…" : "No history"}
            </div>
          )}
        </div>
      </div>

      {/* 4. Holdings list — wrapped in same `px-3.5 py-3` as Fees Source breakdown */}
      <div className="px-3.5 py-3 flex-1 flex flex-col">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-2 h-[14px]">
          Holdings by asset
        </div>
        {!hasData ? (
          <div className="text-[11px] text-text-tertiary text-center py-2">
            {isLoading ? "Loading…" : "No stablecoin data"}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {stablecoins.map((s) => {
              const pct = (s.supply / totalSupplyPct) * 100;
              return (
                <div key={s.symbol} className="flex items-center gap-2">
                  <TokenAvatar assetName={s.symbol} kind="spot" size="md" />
                  <span className="text-[12px] font-semibold text-text-primary">
                    {s.symbol}
                  </span>
                  <span className="text-[10px] text-text-tertiary mono">
                    {fmtCount(s.holders)} holders
                  </span>
                  <span className="mono text-[11.5px] font-semibold text-text-primary ml-auto">
                    {fmtUsdFull(s.supply)}
                  </span>
                  <span className="mono text-[10.5px] text-text-tertiary w-10 text-right">
                    {pct.toFixed(pct < 1 ? 1 : 0)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. footer caveats */}
      <div className="flex items-center gap-x-3 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: Hypurrscan /spotUSDC</span>
        <span className="opacity-50">·</span>
        <span>refresh 60s</span>
      </div>
    </Card>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Stacked bars by stablecoin (USDC / USDH / USDT0 / USDE)
// ─────────────────────────────────────────────────────────────────────────────

type BarGranularity = "day" | "week" | "month";

function pickBarGranularity(n: number): BarGranularity {
  if (n <= 35) return "day";
  if (n <= 100) return "week";
  return "month";
}

function dayStartUtc(ts: number): number {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
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

/** Stables are a STOCK (cumulative supply), not a flow — take the LAST point
 * per UTC bucket, not the sum. Last = the most-recent snapshot of supply for
 * that period. Hypurrscan `/spotUSDC` may post multiple snapshots per day, so
 * we always dedupe to 1 point per UTC day first — otherwise 30D could contain
 * 100+ raw points and `pickBarGranularity` would fall back to week/month,
 * producing a handful of bars with huge gaps between them. */
function bucketStableRows(
  rows: StablecoinSupplyByCoinPoint[],
  g: BarGranularity,
): StablecoinSupplyByCoinPoint[] {
  const keyFn = g === "day" ? dayStartUtc : g === "week" ? weekStartUtc : monthStartUtc;
  const buckets = new Map<number, StablecoinSupplyByCoinPoint>();
  for (const r of rows) {
    const k = keyFn(r.time);
    const prev = buckets.get(k);
    if (!prev || r.time > prev.time) {
      buckets.set(k, { ...r, time: k });
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
}

function StablesStackedBars({
  data,
  height,
}: {
  data: StablecoinSupplyByCoinPoint[];
  height: number;
}) {
  const uid = useId().replace(/:/g, "");

  const bucketed = useMemo(() => {
    // Dedupe to daily first so the granularity picker sees the actual day
    // count (Hypurrscan can post several snapshots per UTC day).
    const daily = bucketStableRows(data, "day");
    const g = pickBarGranularity(daily.length);
    return g === "day" ? daily : bucketStableRows(daily, g);
  }, [data]);

  /** Topmost coin per row (USDC → USDH → USDT0 → USDE order). Skipping zero
   * segments so the rounded corners land on the actually-visible top. */
  const topByRow = useMemo(() => {
    return bucketed.map((row) => {
      for (let i = STABLE_SERIES.length - 1; i >= 0; i--) {
        if ((row[STABLE_SERIES[i].key as StableKey] ?? 0) > 0) return i;
      }
      return -1;
    });
  }, [bucketed]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={bucketed}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        barCategoryGap={3}
        barGap={0}
        maxBarSize={32}
      >
        <defs>
          {STABLE_SERIES.map((s) => (
            <linearGradient
              key={s.key}
              id={`stables-bar-grad-${uid}-${s.key}`}
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
          tickFormatter={fmtTickDate}
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          minTickGap={48}
        />
        <YAxis
          tickFormatter={(v) => fmtUsdAxis(Number(v))}
          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.06)" }}
          content={<StablesStackedTooltip />}
        />
        {STABLE_SERIES.map((s, seriesIdx) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            stackId="stables"
            fill={`url(#stables-bar-grad-${uid}-${s.key})`}
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
}

/** Same selectively-rounded segment shape used by RevenueChart. */
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

interface StablesTooltipProps {
  active?: boolean;
  payload?: { payload: StablecoinSupplyByCoinPoint }[];
}

function StablesStackedTooltip({ active, payload }: StablesTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  const total = STABLE_SERIES.reduce(
    (acc, s) => acc + (row[s.key as StableKey] ?? 0),
    0,
  );
  return (
    <div
      className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40"
      style={{ minWidth: 200 }}
    >
      <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
        {new Date(row.time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <div className="mono text-[14px] font-bold text-text-primary mt-0.5">
        {fmtUsdCompact(total)}
      </div>
      <div className="mt-1.5 space-y-0.5">
        {STABLE_SERIES.filter((s) => (row[s.key as StableKey] ?? 0) > 0).map(
          (s) => (
            <div key={s.key} className="flex items-center gap-2 text-[11px]">
              <TokenAvatar assetName={s.key} kind="spot" size="sm" />
              <span className="text-text-secondary flex-1">{s.key}</span>
              <span className="mono font-semibold text-text-primary">
                {fmtUsdCompact(row[s.key as StableKey] ?? 0)}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

/**
 * Tiny icon-button to switch the chart between area and bar.
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
