"use client";

import { memo, useId, useMemo, useState } from "react";
import { Vault } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartError, ChartLoading, PeriodSelector, chartPalette , rechartsXAxisPadding , rechartsGridDefaults } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useTvlHistory } from "@/services/ecosystem/project/hooks";

/**
 * The deposit base over time.
 *
 * The operating metrics say what the venue moved in a day. This says what it
 * is holding while it does — the collateral traders have parked there, which
 * is the closest thing a protocol has to a balance sheet and the slowest of
 * its numbers to move. Volume can double on one week of volatility; the
 * deposit base only grows when people decide to leave money on the venue.
 *
 * It also frames the buyback: a fee stream is only as durable as the capital
 * sitting behind it.
 */

const WINDOWS = ["90D", "1Y", "All"] as const;
type Window = (typeof WINDOWS)[number];

const WINDOW_DAYS: Record<Window, number | null> = { "90D": 90, "1Y": 365, All: null };

const HYPERLIQUID_SLUG = "hyperliquid";

const formatUsdAxis = (value: number): string =>
  value >= 1e9 ? compactUsd(value, { decimals: 1 }) : compactUsd(value, { decimals: 0, fallback: "$0" });

const formatDay = (ms: number): string =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

interface TvlPoint {
  time: number;
  tvl: number;
}

const TvlTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: TvlPoint }[];
}) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2 shadow-2xl shadow-black/40">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {new Date(point.time).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })}
      </div>
      <div className="mt-1 text-[14px] font-semibold text-text-primary mono tabular-nums">
        {compactUsd(point.tvl)}
      </div>
    </div>
  );
};

export const TvlHistoryCard = memo(function TvlHistoryCard() {
  const [window, setWindow] = useState<Window>("1Y");
  const uid = useId().replace(/:/g, "");
  const { history, isLoading, error } = useTvlHistory(HYPERLIQUID_SLUG);

  /** The all-chains series: Hyperliquid's own chain is the bulk of it, but the
   *  protocol total is the figure aggregators and comparisons quote. */
  const full: TvlPoint[] = useMemo(
    () =>
      (history?.global ?? [])
        .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v))
        .map((p) => ({ time: p.t, tvl: p.v })),
    [history]
  );

  const data = useMemo(() => {
    const span = WINDOW_DAYS[window];
    if (span == null || full.length === 0) return full;
    const cutoff = full[full.length - 1].time - span * 86_400_000;
    return full.filter((p) => p.time >= cutoff);
  }, [full, window]);

  const stats = useMemo(() => {
    if (data.length === 0) return { current: null, change: null, peak: null, low: null };
    const first = data[0].tvl;
    const current = data[data.length - 1].tvl;
    const values = data.map((p) => p.tvl);
    return {
      current,
      change: first > 0 ? (current - first) / first : null,
      peak: Math.max(...values),
      low: Math.min(...values),
    };
  }, [data]);

  const isEmpty = !isLoading && !error && data.length === 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Vault size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Total Value Locked</h3>
        <PeriodSelector
          className="ml-auto"
          selected={window}
          onChange={setWindow}
          options={WINDOWS}
          variant="aurora"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-subtle">
        {[
          { label: "Now", value: compactUsd(stats.current), sub: "capital on the venue", tone: "" },
          {
            label: "Change",
            value:
              stats.change == null
                ? "—"
                : `${stats.change >= 0 ? "+" : ""}${(stats.change * 100).toFixed(0)}%`,
            sub: "over the window",
            tone: stats.change == null ? "" : stats.change >= 0 ? "text-success" : "text-danger",
          },
          { label: "Peak", value: compactUsd(stats.peak), sub: "highest in window", tone: "" },
          { label: "Trough", value: compactUsd(stats.low), sub: "lowest in window", tone: "" },
        ].map((cell) => (
          <div key={cell.label} className="bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
              {cell.label}
            </div>
            <div
              className={`text-[16px] font-semibold mono mt-1 ${cell.tone || "text-text-primary"}`}
            >
              {cell.value}
            </div>
            <div className="text-[10.5px] text-text-tertiary/80 mt-0.5">{cell.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 px-2 pt-3 pb-2">
        {error ? (
          <ChartError />
        ) : isLoading && full.length === 0 ? (
          <ChartLoading />
        ) : isEmpty ? (
          <div className="h-[240px] grid place-items-center text-[12px] text-text-tertiary">
            No TVL history available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`tvl-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.accent} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={chartPalette.accent} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid {...rechartsGridDefaults} />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                scale="time"
                tickFormatter={formatDay}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={44}
                padding={rechartsXAxisPadding}
              />
              <YAxis
                tickFormatter={(v) => formatUsdAxis(Number(v))}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip cursor={{ stroke: "rgba(255,255,255,0.12)" }} content={<TvlTooltip />} />
              <Area
                type="monotone"
                dataKey="tvl"
                stroke={chartPalette.accent}
                strokeWidth={1.6}
                fill={`url(#tvl-${uid})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: DefiLlama · protocol TVL across every chain it reports</span>
        <span className="opacity-50">·</span>
        <span>Bridged collateral, not the token&apos;s market cap.</span>
      </div>
    </Card>
  );
});
