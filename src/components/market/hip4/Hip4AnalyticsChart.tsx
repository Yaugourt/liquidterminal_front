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
import { TrendingUp, TrendingDown, BarChart2, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { chartPalette, chartColors } from "@/components/common";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import { useHip4Analytics } from "@/services/indexer/hip4";
import type { Hip4AnalyticsInterval } from "@/services/indexer/hip4";

// ─── Constants ──────────────────────────────────────────────────────────────

const INTERVALS: { label: string; value: Hip4AnalyticsInterval; limit: number }[] = [
  { label: "1H", value: "1h", limit: 168 },
  { label: "4H", value: "4h", limit: 168 },
  { label: "1D", value: "1d", limit: 90 },
];

const VOL_SERIES = {
  buy_volume: { label: "Buy", color: chartPalette.success },
  sell_volume: { label: "Sell", color: chartPalette.danger },
  fees_usdc: { label: "Fees", color: chartPalette.gold },
} as const;

type VolKey = keyof typeof VOL_SERIES;

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatBucket(iso: string, interval: Hip4AnalyticsInterval) {
  // Upstream bucket timestamps are UTC but emitted without a trailing Z.
  // `new Date('2026-05-26T21:00:00')` would interpret as local time and shift
  // every bar by the user's UTC offset. Force UTC by appending Z.
  const utcIso = iso.endsWith("Z") ? iso : `${iso}Z`;
  const d = new Date(utcIso);
  if (interval === "1d") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
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

  // Normalize buy/sell volume: upstream `buy_volume` often equals `volume`
  // (full notional) rather than the buy-only portion, so a naive stacked chart
  // overdraws the bar to 2x the real total. We treat `sell_volume` as the true
  // sell notional and derive buy = max(0, volume - sell_volume) so the stack
  // sums back to `volume`.
  const data = useMemo(
    () =>
      [...buckets]
        .sort((a, b) => a.bucket.localeCompare(b.bucket))
        .map((b) => {
          const buyDerived = Math.max(0, (b.volume ?? 0) - (b.sell_volume ?? 0));
          return { ...b, buy_volume: buyDerived };
        }),
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
      <Card className="xl:col-span-2 overflow-hidden flex flex-col h-[380px]">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
          <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
            <TrendingUp size={13} className="text-brand" />
          </span>
          <h3 className="text-[13px] font-semibold text-text-primary">Trading Volume</h3>
          {display && (
            <span className="mono text-[11px] text-text-tertiary">
              · {formatBucket(display.bucket, interval)}
            </span>
          )}
          <div className="ml-auto flex items-center rounded-md border border-border-subtle bg-surface-2 p-0.5">
            {INTERVALS.map((iv) => (
              <button
                key={iv.value}
                type="button"
                onClick={() => setInterval(iv.value)}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                  interval === iv.value
                    ? "bg-surface text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {iv.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-3.5 py-3 flex items-baseline gap-3">
          <div className="mono text-[22px] font-semibold tracking-[-0.02em] text-text-primary leading-none">
            {display
              ? compactUsd((visible.buy_volume ? display.buy_volume : 0) + (visible.sell_volume ? display.sell_volume : 0))
              : "—"}
          </div>
          {totals && (
            <div className="flex items-center gap-1.5 text-[11px]">
              {totals.delta >= 0
                ? <TrendingUp size={12} className="text-success" />
                : <TrendingDown size={12} className="text-danger" />}
              <span className={`mono ${totals.delta >= 0 ? "text-success" : "text-danger"}`}>
                {totals.delta >= 0 ? "+" : ""}{compactUsd(totals.delta)}
              </span>
              <span className="text-text-tertiary">vs window start</span>
            </div>
          )}
        </div>

        <div className="px-3.5 pb-2 flex flex-wrap gap-1.5">
          {(Object.keys(VOL_SERIES) as VolKey[]).map((key) => {
            const meta = VOL_SERIES[key];
            const isOn = visible[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}
                className={`flex items-center gap-1.5 rounded border px-2 py-0.5 transition-all ${
                  isOn ? "border-border-default bg-surface-2" : "border-border-subtle opacity-50 hover:opacity-80"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  {meta.label}
                </span>
                {display && (
                  <span className="mono text-[10.5px] font-semibold text-text-primary">
                    {key === "fees_usdc" ? compactUsd(display[key]) : compactUsd(display[key as "buy_volume" | "sell_volume"])}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-h-0 px-3.5 pb-3">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <InlineSpinner className="h-5 w-5 text-brand" />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-[11px] text-danger">
              Failed to load analytics
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-[11px] text-text-tertiary">
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
                <CartesianGrid strokeDasharray="3 5" stroke={chartColors.gridLine} vertical={false} />
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
                  cursor={{ stroke: chartPalette.accent, strokeOpacity: 0.25, strokeDasharray: "3 3" }}
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
      </Card>

      {/* ── Activity bar chart ── */}
      <Card className="overflow-hidden flex flex-col h-[380px]">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
          <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
            <Activity size={13} className="text-brand" />
          </span>
          <h3 className="text-[13px] font-semibold text-text-primary">Activity</h3>
          <BarChart2 size={11} className="text-text-tertiary ml-auto" />
        </div>

        <div className="px-3.5 py-3">
          <div className="mono text-[22px] font-semibold tracking-[-0.02em] text-text-primary leading-none">
            {isLoading ? "—" : compactCount(data.reduce((s, b) => s + b.fills, 0))}
            <span className="ml-1.5 text-[13px] font-normal text-text-tertiary">fills</span>
          </div>
          <div className="mt-1 mono text-[11px] text-text-secondary">
            {isLoading ? "—" : compactCount(data.reduce((s, b) => s + b.unique_users, 0))}
            <span className="ml-1 text-text-tertiary">unique traders</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 px-3.5 pb-3">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <InlineSpinner className="h-5 w-5 text-brand" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-[11px] text-text-tertiary">
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
                <CartesianGrid strokeDasharray="3 5" stroke={chartColors.gridLine} vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(v) => formatBucket(v, interval)}
                  tick={{ fill: chartColors.textMuted, fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={50}
                />
                <YAxis
                  tickFormatter={(v) => compactCount(Number(v))}
                  tick={{ fill: chartColors.textMuted, fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip
                  cursor={{ fill: chartColors.gridLine }}
                  content={<ActivityTooltip interval={interval} />}
                />
                <Bar dataKey="fills" fill="url(#hip4-g-fills)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
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
    <div className="rounded-lg border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl min-w-[180px]">
      <div className="mono text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
        {formatBucket(label, interval)}
      </div>
      {(Object.keys(VOL_SERIES) as VolKey[]).map((key) => {
        if (!visible[key]) return null;
        const meta = VOL_SERIES[key];
        const p = payload.find((x) => x.dataKey === key);
        if (!p) return null;
        return (
          <div key={key} className="flex items-center justify-between gap-3 text-[11.5px] mb-1">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
              <span className="text-text-secondary">{meta.label}</span>
            </div>
            <span className="mono font-semibold text-text-primary">
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
    <div className="rounded-lg border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl min-w-[140px]">
      <div className="mono text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
        {formatBucket(label, interval)}
      </div>
      <div className="flex items-center justify-between gap-3 text-[11.5px]">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          <span className="text-text-secondary">Fills</span>
        </div>
        <span className="mono font-semibold text-text-primary">{compactCount(fills)}</span>
      </div>
    </div>
  );
}
