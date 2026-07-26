"use client";

import { memo, useId, useMemo } from "react";
import { Gauge } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartError, ChartLoading, chartPalette } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { toHourlyFeeFlow } from "@/services/market/fees/derive";
import { useFeesHistory } from "@/services/market/fees/hooks/useFeesHistory";
import { SeriesLegend } from "./SeriesLegend";

/**
 * The venue's fee rate, hour by hour, split by book.
 *
 * Everything else on this page reports days. This reports hours, which is the
 * scale an operating business is actually run at: it shows the session cycle,
 * the weekend, and how much of the rate survives when Asia is asleep. Public
 * aggregates only publish daily totals, so this resolution has to be derived
 * from our own counter.
 *
 * Perp is the residual of total less spot, which is exactly how the counter
 * reports it. There is no third book in the number: HIP-1, HIP-3 and priority
 * fees are settled elsewhere and show up in the revenue breakdown instead.
 */

const formatUsdAxis = (value: number): string => compactUsd(value, { decimals: 0, fallback: "$0" });

// Everything here is stamped UTC, including the labels: an hourly chart read in
// a local zone would put the session cycle in the wrong place.
const formatHour = (ms: number): string =>
  new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    timeZone: "UTC",
  });

const formatTick = (ms: number): string => {
  const date = new Date(ms);
  return date.getUTCHours() === 0
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    : `${String(date.getUTCHours()).padStart(2, "0")}h`;
};

const HourTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: { time: number; perp: number; spot: number; total: number } }[];
}) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[180px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {formatHour(point.time)} UTC
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: chartPalette.accent }} />
            Perp
          </span>
          <span className="text-[11.5px] text-text-primary mono tabular-nums">
            {compactUsd(point.perp)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: chartPalette.gold }} />
            Spot
          </span>
          <span className="text-[11.5px] text-text-primary mono tabular-nums">
            {compactUsd(point.spot)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1.5 mt-1 border-t border-border-subtle">
          <span className="text-[11px] text-text-tertiary">Total</span>
          <span className="text-[11.5px] font-semibold text-text-primary mono tabular-nums">
            {compactUsd(point.total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export const FeeRunRateCard = memo(function FeeRunRateCard() {
  const uid = useId().replace(/:/g, "");
  const { feesHistory, isLoading, error } = useFeesHistory();

  const hours = useMemo(() => toHourlyFeeFlow(feesHistory), [feesHistory]);

  const summary = useMemo(() => {
    if (hours.length === 0) {
      return { last24h: null, perpShare: null, peak: null, avgHour: null, span: 0 };
    }
    const last24h = hours.slice(-24);
    const sum = (rows: typeof hours, key: "perp" | "spot" | "total") =>
      rows.reduce((acc, h) => acc + h[key], 0);

    const total24h = sum(last24h, "total");
    const peak = hours.reduce((best, h) => (h.total > best.total ? h : best), hours[0]);

    return {
      last24h: total24h,
      perpShare: total24h > 0 ? sum(last24h, "perp") / total24h : null,
      peak,
      avgHour: sum(hours, "total") / hours.length,
      span: hours.length,
    };
  }, [hours]);

  const isEmpty = !isLoading && !error && hours.length === 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Gauge size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Fee Run Rate</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono ml-auto">
          {summary.span > 0 ? `hourly · ${summary.span}h` : "hourly"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-subtle">
        {[
          {
            label: "Last 24h",
            value: summary.last24h == null ? "—" : compactUsd(summary.last24h),
            sub: "fees charged",
          },
          {
            label: "Perp share",
            value: summary.perpShare == null ? "—" : `${(summary.perpShare * 100).toFixed(1)}%`,
            sub: "of the last 24h",
          },
          {
            label: "Avg hour",
            value: summary.avgHour == null ? "—" : compactUsd(summary.avgHour),
            sub: "across the window",
          },
          {
            label: "Peak hour",
            value: summary.peak == null ? "—" : compactUsd(summary.peak.total),
            sub: summary.peak == null ? "—" : `${formatHour(summary.peak.time)} UTC`,
          },
        ].map((cell) => (
          <div key={cell.label} className="bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
              {cell.label}
            </div>
            <div className="text-[16px] font-semibold text-text-primary mono mt-1">{cell.value}</div>
            <div className="text-[10.5px] text-text-tertiary/80 mt-0.5 truncate">{cell.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 px-2 pt-3 pb-2">
        {error ? (
          <ChartError />
        ) : isLoading && hours.length === 0 ? (
          <ChartLoading />
        ) : isEmpty ? (
          <div className="h-[240px] grid place-items-center text-[12px] text-text-tertiary">
            Not enough samples to derive an hourly rate
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hours} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`frr-perp-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.accent} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={chartPalette.accent} stopOpacity={0.06} />
                </linearGradient>
                <linearGradient id={`frr-spot-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.gold} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={chartPalette.gold} stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 5" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                scale="time"
                tickFormatter={formatTick}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                tickFormatter={(v) => formatUsdAxis(Number(v))}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip cursor={{ stroke: "rgba(255,255,255,0.12)" }} content={<HourTooltip />} />
              <Area
                type="monotone"
                dataKey="perp"
                stackId="fee"
                stroke={chartPalette.accent}
                strokeWidth={1.3}
                fill={`url(#frr-perp-${uid})`}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="spot"
                stackId="fee"
                stroke={chartPalette.gold}
                strokeWidth={1}
                fill={`url(#frr-spot-${uid})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <SeriesLegend
        items={[
          { key: "perp", label: "Perp", color: chartPalette.accent },
          { key: "spot", label: "Spot", color: chartPalette.gold },
        ]}
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Derived from our own cumulative fee counter, differenced per hour</span>
        <span className="opacity-50">·</span>
        <span>Hours are UTC. The running hour is excluded.</span>
      </div>
    </Card>
  );
});
