"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { chartPalette, chartColors } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useHip4Analytics } from "@/services/indexer/hip4";
import type { Hip4AnalyticsInterval } from "@/services/indexer/hip4";

// ─── Constants ──────────────────────────────────────────────────────────────

const INTERVALS: { label: string; value: Hip4AnalyticsInterval; limit: number }[] = [
  { label: "1H", value: "1h", limit: 168 },
  { label: "4H", value: "4h", limit: 168 },
  { label: "1D", value: "1d", limit: 90 },
];

const VOL_SERIES = {
  buy_volume: { label: "Buy Vol", color: chartPalette.emeraldLight, glow: "rgb(var(--chart-up-rgb) / 0.35)" },
  sell_volume: { label: "Sell Vol", color: chartPalette.roseSoft, glow: "rgb(var(--chart-down-rgb) / 0.35)" },
  fees_usdc: { label: "Fees", color: chartPalette.gold, glow: "rgb(var(--brand-gold-rgb) / 0.30)" },
} as const;

type VolKey = keyof typeof VOL_SERIES;

// ─── Formatters ──────────────────────────────────────────────────────────────

function compactNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

function formatBucket(iso: string, interval: Hip4AnalyticsInterval) {
  const d = new Date(iso);
  if (interval === "1d") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Hip4AnalyticsChart() {
  const [interval, setInterval] = useState<Hip4AnalyticsInterval>("1h");
  const [visible, setVisible] = useState<Record<VolKey, boolean>>({
    buy_volume: true,
    sell_volume: true,
    fees_usdc: false,
  });
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const cfg = INTERVALS.find((x) => x.value === interval)!;
  const { buckets, isLoading, error } = useHip4Analytics({
    interval,
    limit: cfg.limit,
  });

  // Recharts needs ascending time order
  const data = useMemo(
    () => [...buckets].sort((a, b) => a.bucket.localeCompare(b.bucket)),
    [buckets]
  );

  const last = data[data.length - 1];
  const first = data[0];

  const totals = useMemo(() => {
    if (!last || !first) return null;
    const cur = last.buy_volume + last.sell_volume;
    const prv = first.buy_volume + first.sell_volume;
    const delta = cur - prv;
    const pct = prv > 0 ? (delta / prv) * 100 : 0;
    return { cur, delta, pct };
  }, [first, last]);

  const display = hoverIdx !== null && data[hoverIdx] ? data[hoverIdx] : last;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* ── Volume area chart ── */}
      <div className="xl:col-span-2 bg-surface border border-border-subtle rounded-lg relative overflow-hidden h-[380px] flex flex-col p-6">
        <div className="pointer-events-none absolute -top-28 right-0 h-64 w-64 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-20 h-56 w-56 rounded-full bg-rose-400/8 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              Trading Volume
              {display && (
                <>
                  <span className="text-text-tertiary/60">·</span>
                  <span>{formatBucket(display.bucket, interval)}</span>
                </>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={display?.bucket ?? "empty"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1 text-[28px] font-bold text-text-primary tabular-nums tracking-tight"
              >
                {display
                  ? compactUsd((visible.buy_volume ? display.buy_volume : 0) + (visible.sell_volume ? display.sell_volume : 0))
                  : "—"}
              </motion.div>
            </AnimatePresence>
            {totals && (
              <div className="flex items-center gap-1.5 text-sm tabular-nums">
                {totals.delta >= 0
                  ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  : <TrendingDown className="h-3.5 w-3.5 text-rose-400" />}
                <span className={totals.delta >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {totals.delta >= 0 ? "+" : ""}{compactUsd(totals.delta)}
                </span>
                <span className="text-text-tertiary">last bucket vs first</span>
              </div>
            )}
          </div>

          {/* Interval selector */}
          <div className="flex items-center rounded-lg border border-border-subtle bg-black/30 p-1">
            {INTERVALS.map((iv) => (
              <button
                key={iv.value}
                type="button"
                onClick={() => setInterval(iv.value)}
                className="relative rounded-lg px-3 py-1 text-[11px] font-semibold"
              >
                {interval === iv.value && (
                  <motion.span
                    layoutId="hip4-analytics-interval"
                    className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className={`relative z-10 ${interval === iv.value ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}>
                  {iv.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Legend toggles */}
        <div className="relative z-10 mt-3 flex flex-wrap gap-2">
          {(Object.keys(VOL_SERIES) as VolKey[]).map((key) => {
            const meta = VOL_SERIES[key];
            const isOn = visible[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all ${isOn ? "border-border-default bg-white/[0.03]" : "border-border-subtle opacity-40 hover:opacity-65"
                  }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: meta.color, boxShadow: isOn ? `0 0 10px ${meta.glow}` : "none" }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  {meta.label}
                </span>
                {display && (
                  <span className="text-[11px] font-bold text-text-primary tabular-nums">
                    {key === "fees_usdc" ? compactUsd(display[key]) : compactUsd(display[key as "buy_volume" | "sell_volume"])}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Chart body */}
        <div className="relative z-10 mt-4 flex-1 min-h-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <InlineSpinner className="h-5 w-5 text-brand" />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-xs text-rose-400">
              Failed to load analytics
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-text-tertiary">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                onMouseMove={(e) => {
                  if (e && typeof e.activeTooltipIndex === "number") setHoverIdx(e.activeTooltipIndex);
                }}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="hip4-g-buy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={VOL_SERIES.buy_volume.color} stopOpacity={0.40} />
                    <stop offset="100%" stopColor={VOL_SERIES.buy_volume.color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hip4-g-sell" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={VOL_SERIES.sell_volume.color} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={VOL_SERIES.sell_volume.color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hip4-g-fees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={VOL_SERIES.fees_usdc.color} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={VOL_SERIES.fees_usdc.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(v) => formatBucket(v, interval)}
                  tick={{ fill: chartColors.textMuted, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={50}
                />
                <YAxis
                  tickFormatter={(v) => compactUsd(Number(v))}
                  tick={{ fill: chartColors.textMuted, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={62}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(131,233,255,0.25)", strokeDasharray: "3 3" }}
                  content={<VolumeTooltip visible={visible} interval={interval} />}
                />
                {visible.buy_volume && (
                  <Area type="monotone" dataKey="buy_volume" stroke={VOL_SERIES.buy_volume.color}
                    strokeWidth={2} fill="url(#hip4-g-buy)" isAnimationActive={false} />
                )}
                {visible.sell_volume && (
                  <Area type="monotone" dataKey="sell_volume" stroke={VOL_SERIES.sell_volume.color}
                    strokeWidth={2} fill="url(#hip4-g-sell)" isAnimationActive={false} />
                )}
                {visible.fees_usdc && (
                  <Area type="monotone" dataKey="fees_usdc" stroke={VOL_SERIES.fees_usdc.color}
                    strokeWidth={1.5} fill="url(#hip4-g-fees)" isAnimationActive={false} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Activity bar chart (fills + unique users) ── */}
      <div className="bg-surface border border-border-subtle rounded-lg relative overflow-hidden h-[380px] flex flex-col p-6">
        <div className="pointer-events-none absolute -top-20 right-0 h-48 w-48 rounded-full bg-brand/8 blur-3xl" />

        <div className="relative z-10 mb-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            <BarChart2 className="h-3 w-3 text-brand" />
            Activity
          </div>
          <div className="mt-1 text-[20px] font-bold text-text-primary tabular-nums">
            {isLoading ? "—" : compactNum(data.reduce((s, b) => s + b.fills, 0))}
            <span className="ml-1.5 text-[13px] font-normal text-text-tertiary">fills</span>
          </div>
          <div className="mt-0.5 text-[12px] text-text-secondary tabular-nums">
            {isLoading ? "—" : compactNum(data.reduce((s, b) => s + b.unique_users, 0))}
            <span className="ml-1 text-text-tertiary">unique traders (total window)</span>
          </div>
        </div>

        <div className="relative z-10 flex-1 min-h-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <InlineSpinner className="h-5 w-5 text-brand" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-text-tertiary">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="20%">
                <defs>
                  <linearGradient id="hip4-g-fills" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartPalette.accent} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={chartPalette.accent} stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(v) => formatBucket(v, interval)}
                  tick={{ fill: chartColors.textMuted, fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={50}
                />
                <YAxis
                  tickFormatter={(v) => compactNum(Number(v))}
                  tick={{ fill: chartColors.textMuted, fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={<ActivityTooltip interval={interval} />}
                />
                <Bar dataKey="fills" fill="url(#hip4-g-fills)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tooltips ────────────────────────────────────────────────────────────────

interface VolumeTooltipProps {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number | string }[];
  label?: string;
  visible: Record<VolKey, boolean>;
  interval: Hip4AnalyticsInterval;
}

function VolumeTooltip({ active, payload, label, visible, interval }: VolumeTooltipProps) {
  if (!active || !payload || payload.length === 0 || !label) return null;
  return (
    <div className="rounded-lg border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[190px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
        {formatBucket(label, interval)}
      </div>
      {(Object.keys(VOL_SERIES) as VolKey[]).map((key) => {
        if (!visible[key]) return null;
        const meta = VOL_SERIES[key];
        const p = payload.find((x) => x.dataKey === key);
        if (!p) return null;
        return (
          <div key={key} className="flex items-center justify-between gap-3 text-xs mb-1">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
              <span className="text-text-secondary">{meta.label}</span>
            </div>
            <span className="font-semibold text-text-primary tabular-nums">
              {compactUsd(Number(p.value))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface ActivityTooltipProps {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number | string }[];
  label?: string;
  interval: Hip4AnalyticsInterval;
}

function ActivityTooltip({ active, payload, label, interval }: ActivityTooltipProps) {
  if (!active || !payload || payload.length === 0 || !label) return null;
  const fills = Number(payload.find((x) => x.dataKey === "fills")?.value ?? 0);
  return (
    <div className="rounded-lg border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[160px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
        {formatBucket(label, interval)}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          <span className="text-text-secondary">Fills</span>
        </div>
        <span className="font-semibold text-text-primary tabular-nums">{compactNum(fills)}</span>
      </div>
    </div>
  );
}
