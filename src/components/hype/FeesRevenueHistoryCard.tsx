"use client";

import { memo, useId, useMemo, useState } from "react";
import { AreaChart as AreaChartIcon, Percent, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { ChartError, ChartLoading, PeriodSelector, chartPalette } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { movingAverage, useFeeRevenueHistory, type FeeRevenueDay } from "@/services/market/fundamentals";

/**
 * The income statement as a time series.
 *
 * The statement card answers "what did the protocol keep last month". This
 * answers the question that actually moves a valuation: is the share it keeps
 * holding up. Fees are drawn as two stacked bands — what went back to the
 * people providing liquidity and flow, and what the protocol kept — so the
 * split is legible without reading a single number.
 *
 * The margin view is the same data divided rather than stacked, smoothed over
 * seven days. Daily margin moves several points on venue mix alone; the raw
 * line reads as noise and hides the only thing worth watching here, which is
 * whether the take is being competed away over quarters.
 */

const WINDOWS = ["30D", "90D", "1Y", "All"] as const;
type Window = (typeof WINDOWS)[number];

const WINDOW_DAYS: Record<Window, number | null> = {
  "30D": 30,
  "90D": 90,
  "1Y": 365,
  All: null,
};

type View = "split" | "margin";

/** 7 days: a full week of venue mix, the shortest span that is not noise. */
const MARGIN_SMOOTHING = 7;

const formatUsdAxis = (value: number): string =>
  value >= 1e9 ? compactUsd(value, { decimals: 1 }) : compactUsd(value, { decimals: 0, fallback: "$0" });

// UTC on every label: the buckets are UTC days, so formatting them in the
// reader's zone shifts every point a day west of Greenwich.
const formatDay = (ms: number): string =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const formatFullDay = (ms: number): string =>
  new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const pct = (value: number | null, digits = 1): string =>
  value == null ? "—" : `${(value * 100).toFixed(digits)}%`;

interface SplitPoint extends FeeRevenueDay {
  /** Present so the tooltip can read the total without re-adding the bands. */
  total: number;
}

interface MarginPoint {
  time: number;
  margin: number;
}

const SplitTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: SplitPoint }[];
}) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[190px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {formatFullDay(point.time)}
      </div>
      <div className="mt-2 space-y-1">
        <Row color={chartPalette.accent} label="Protocol revenue" value={compactUsd(point.revenue)} />
        <Row color={chartPalette.violet} label="Paid out" value={compactUsd(point.paidOut)} />
        <div className="flex items-center justify-between gap-4 pt-1.5 mt-1 border-t border-border-subtle">
          <span className="text-[11px] text-text-secondary">Gross fees</span>
          <span className="text-[11.5px] font-semibold text-text-primary mono tabular-nums">
            {compactUsd(point.total)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] text-text-tertiary">Margin</span>
          <span className="text-[11.5px] text-text-secondary mono tabular-nums">
            {pct(point.margin)}
          </span>
        </div>
      </div>
    </div>
  );
};

const MarginTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: MarginPoint }[];
}) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2 shadow-2xl shadow-black/40">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {formatFullDay(point.time)}
      </div>
      <div className="mt-1 text-[13px] font-semibold text-text-primary mono tabular-nums">
        {pct(point.margin)}
      </div>
      <div className="text-[10px] text-text-tertiary">{MARGIN_SMOOTHING}-day average</div>
    </div>
  );
};

function Row({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="text-[11.5px] text-text-primary mono tabular-nums">{value}</span>
    </div>
  );
}

export const FeesRevenueHistoryCard = memo(function FeesRevenueHistoryCard() {
  const [window, setWindow] = useState<Window>("90D");
  const [view, setView] = useState<View>("split");
  const uid = useId().replace(/:/g, "");
  const { days: history, isLoading, error } = useFeeRevenueHistory();

  const days = useMemo(() => {
    const span = WINDOW_DAYS[window];
    return span == null ? history : history.slice(-span);
  }, [history, window]);

  const splitData: SplitPoint[] = useMemo(
    () => days.map((d) => ({ ...d, total: d.fees })),
    [days]
  );

  const marginData: MarginPoint[] = useMemo(() => {
    const smoothed = movingAverage(
      days.map((d) => d.margin),
      MARGIN_SMOOTHING
    );
    return days
      .map((d, i) => ({ time: d.time, margin: smoothed[i] }))
      .filter((p): p is MarginPoint => p.margin != null);
  }, [days]);

  const totals = useMemo(() => {
    const fees = days.reduce((sum, d) => sum + d.fees, 0);
    const revenue = days.reduce((sum, d) => sum + d.revenue, 0);
    return {
      fees,
      revenue,
      margin: fees > 0 ? revenue / fees : null,
      perDay: days.length > 0 ? revenue / days.length : null,
    };
  }, [days]);

  /** Margin drift: the last smoothed point against the first one on screen.
   *  Two figures from the same series, so the comparison is like for like. */
  const drift = useMemo(() => {
    if (marginData.length < 2) return null;
    return marginData[marginData.length - 1].margin - marginData[0].margin;
  }, [marginData]);

  const isEmpty = !isLoading && !error && days.length === 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <AreaChartIcon size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Fees &amp; Revenue</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-black/30 p-0.5">
            <ViewButton
              active={view === "split"}
              onClick={() => setView("split")}
              Icon={AreaChartIcon}
              label="Split"
            />
            <ViewButton
              active={view === "margin"}
              onClick={() => setView("margin")}
              Icon={Percent}
              label="Margin"
            />
          </div>
          <PeriodSelector
            selected={window}
            onChange={setWindow}
            options={WINDOWS}
            variant="aurora"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-subtle">
        {[
          { label: "Gross fees", value: compactUsd(totals.fees), sub: "what users paid" },
          { label: "Protocol revenue", value: compactUsd(totals.revenue), sub: "what was kept" },
          { label: "Gross margin", value: pct(totals.margin), sub: "over the window" },
          {
            label: "Revenue / day",
            value: totals.perDay == null ? "—" : compactUsd(totals.perDay),
            sub: `${days.length} completed days`,
          },
        ].map((cell) => (
          <div key={cell.label} className="bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
              {cell.label}
            </div>
            <div className="text-[16px] font-semibold text-text-primary mono mt-1">
              {cell.value}
            </div>
            <div className="text-[10.5px] text-text-tertiary/80 mt-0.5">{cell.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 px-2 pt-3 pb-2">
        {error ? (
          <ChartError />
        ) : isLoading && history.length === 0 ? (
          <ChartLoading />
        ) : isEmpty ? (
          <div className="h-[240px] grid place-items-center text-[12px] text-text-tertiary">
            No completed days in this window
          </div>
        ) : view === "split" ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={splitData} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`fr-rev-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.accent} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={chartPalette.accent} stopOpacity={0.06} />
                </linearGradient>
                <linearGradient id={`fr-out-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.violet} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={chartPalette.violet} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 5" stroke="rgba(255,255,255,0.04)" vertical={false} />
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
              />
              <YAxis
                tickFormatter={(v) => formatUsdAxis(Number(v))}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip cursor={{ stroke: "rgba(255,255,255,0.12)" }} content={<SplitTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="fees"
                stroke={chartPalette.accent}
                strokeWidth={1.4}
                fill={`url(#fr-rev-${uid})`}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="paidOut"
                stackId="fees"
                stroke={chartPalette.violet}
                strokeWidth={1}
                fill={`url(#fr-out-${uid})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={marginData} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 5" stroke="rgba(255,255,255,0.04)" vertical={false} />
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
              />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 0.25, 0.5, 0.75, 1]}
                tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <ReferenceLine
                y={totals.margin ?? 0}
                stroke={chartPalette.gold}
                strokeDasharray="4 4"
                strokeOpacity={0.45}
              />
              <Tooltip cursor={{ stroke: "rgba(255,255,255,0.12)" }} content={<MarginTooltip />} />
              <Line
                type="monotone"
                dataKey="margin"
                stroke={chartPalette.accent}
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: DefiLlama daily series</span>
        <span className="opacity-50">·</span>
        <span>The running day is excluded: it is partial and would draw as a collapse.</span>
        {view === "margin" && drift != null && (
          <>
            <span className="opacity-50">·</span>
            <span className="inline-flex items-center gap-1">
              {drift >= 0 ? (
                <TrendingUp size={10} className="text-success" />
              ) : (
                <TrendingDown size={10} className="text-danger" />
              )}
              {`${drift >= 0 ? "+" : ""}${(drift * 100).toFixed(1)}pts across the window`}
            </span>
          </>
        )}
      </div>
    </Card>
  );
});

function ViewButton({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: typeof AreaChartIcon;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`px-1.5 py-1 rounded-md transition-colors ${
        active ? "bg-white/[0.06] text-brand" : "text-text-tertiary hover:text-text-secondary"
      }`}
    >
      <Icon size={12} />
    </button>
  );
}
