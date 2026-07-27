"use client";

import { memo, useId, useMemo, useState } from "react";
import { Layers, Percent, DollarSign } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartError, ChartLoading, PeriodSelector, chartPalette } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useRevenueBreakdown, type RevenueWindow } from "@/services/market/revenue";
import { SeriesLegend } from "./SeriesLegend";
import { SourceCoverageNote } from "./SourceCoverageNote";

/**
 * Where revenue comes from, over time.
 *
 * The single most useful thing our own endpoint has that no public aggregate
 * does: revenue split six ways rather than reported as one line. A venue that
 * earns 95% of its revenue from perp taker fees is a different business from
 * one that earns 70% and is growing three other books, and only the mix over
 * time tells them apart.
 *
 * The share view is the one to read for that question — absolute dollars move
 * with the cycle and drown a segment that is doubling from a small base.
 */

const SOURCES = [
  { key: "perp", label: "Perp", color: chartPalette.multiSeries[0] },
  { key: "spot", label: "Spot", color: chartPalette.multiSeries[2] },
  { key: "hip1", label: "HIP-1 auctions", color: chartPalette.multiSeries[3] },
  { key: "hip3", label: "HIP-3 auctions", color: chartPalette.multiSeries[6] },
  { key: "hip4", label: "HIP-4", color: chartPalette.multiSeries[4] },
  // Order priority only. Gossip priority is the other HyperCore burn and is not
  // in this series; see RevenueSegmentsCard for the full note.
  { key: "priority", label: "Order priority", color: chartPalette.multiSeries[7] },
] as const;

type SourceKey = (typeof SOURCES)[number]["key"];

const WINDOWS: readonly RevenueWindow[] = ["30d", "90d", "1y", "all"] as const;
const WINDOW_LABELS: Partial<Record<RevenueWindow, string>> = {
  "30d": "30D",
  "90d": "90D",
  "1y": "1Y",
  all: "All",
};

type View = "usd" | "share";

interface MixPoint extends Record<SourceKey, number> {
  time: number;
  total: number;
}

const formatUsdAxis = (value: number): string =>
  value >= 1e9 ? compactUsd(value, { decimals: 1 }) : compactUsd(value, { decimals: 0, fallback: "$0" });

// UTC: the breakdown keys its days as UTC dates, so the axis has to agree.
const formatDay = (ms: number): string =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const formatFullDay = (ms: number): string =>
  new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const MixTooltip = ({
  active,
  payload,
  view,
}: {
  active?: boolean;
  payload?: { payload?: MixPoint }[];
  view: View;
}) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;

  const present = SOURCES.filter((s) => point[s.key] > 0);

  return (
    <div className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[200px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {formatFullDay(point.time)}
      </div>
      <div className="mt-2 space-y-1">
        {present.length === 0 && (
          <div className="text-[11px] text-text-tertiary">No revenue recorded</div>
        )}
        {present.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="text-[11.5px] text-text-primary mono tabular-nums">
              {view === "share" && point.total > 0
                ? `${((point[s.key] / point.total) * 100).toFixed(1)}%`
                : compactUsd(point[s.key])}
            </span>
          </div>
        ))}
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

export const RevenueMixHistoryCard = memo(function RevenueMixHistoryCard() {
  const [window, setWindow] = useState<RevenueWindow>("90d");
  // Dollars by default. Perp is over 90% of the book, so the share view draws
  // one flat band and reads as a broken chart; the concentration it exists to
  // show is stated more precisely by the percentages in the legend below.
  const [view, setView] = useState<View>("usd");
  const uid = useId().replace(/:/g, "");
  const { breakdown, isLoading, error } = useRevenueBreakdown(window);

  const data: MixPoint[] = useMemo(() => {
    return (breakdown?.days ?? []).map((d) => {
      const total = SOURCES.reduce((sum, s) => sum + (d[s.key] ?? 0), 0);
      const point = { time: Date.parse(`${d.date}T00:00:00Z`), total } as MixPoint;
      for (const s of SOURCES) {
        const value = d[s.key] ?? 0;
        point[s.key] = view === "share" && total > 0 ? value / total : value;
      }
      return point;
    });
  }, [breakdown, view]);

  /** Share of the whole window per source — the legend doubles as a summary. */
  const legend = useMemo(() => {
    const days = breakdown?.days ?? [];
    const sums = SOURCES.map((s) => ({
      ...s,
      value: days.reduce((sum, d) => sum + (d[s.key] ?? 0), 0),
    }));
    const total = sums.reduce((sum, s) => sum + s.value, 0);
    return sums
      .map((s) => ({ ...s, share: total > 0 ? s.value / total : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [breakdown]);

  const live = useMemo(() => legend.filter((s) => s.value > 0), [legend]);
  const isEmpty = !isLoading && !error && data.length === 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Layers size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Revenue Mix</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-black/30 p-0.5">
            <button
              onClick={() => setView("share")}
              aria-label="Share of revenue"
              aria-pressed={view === "share"}
              className={`px-1.5 py-1 rounded-md transition-colors ${
                view === "share" ? "bg-white/[0.06] text-brand" : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <Percent size={12} />
            </button>
            <button
              onClick={() => setView("usd")}
              aria-label="Revenue in dollars"
              aria-pressed={view === "usd"}
              className={`px-1.5 py-1 rounded-md transition-colors ${
                view === "usd" ? "bg-white/[0.06] text-brand" : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <DollarSign size={12} />
            </button>
          </div>
          <PeriodSelector
            selected={window}
            onChange={setWindow}
            options={WINDOWS}
            labels={WINDOW_LABELS}
            variant="aurora"
          />
        </div>
      </div>

      <div className="flex-1 px-2 pt-3 pb-2">
        {error ? (
          <ChartError />
        ) : isLoading && data.length === 0 ? (
          <ChartLoading />
        ) : isEmpty ? (
          <div className="h-[240px] grid place-items-center text-[12px] text-text-tertiary">
            No revenue days in this window
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
              <defs>
                {SOURCES.map((s) => (
                  <linearGradient key={s.key} id={`mix-${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.62} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.16} />
                  </linearGradient>
                ))}
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
                domain={view === "share" ? [0, 1] : [0, "auto"]}
                tickFormatter={(v) =>
                  view === "share" ? `${Math.round(Number(v) * 100)}%` : formatUsdAxis(Number(v))
                }
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={view === "share" ? 40 : 52}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.12)" }}
                content={<MixTooltip view={view} />}
              />
              {SOURCES.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stackId="mix"
                  stroke={s.color}
                  strokeWidth={0.9}
                  fill={`url(#mix-${uid}-${s.key})`}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <SeriesLegend
        items={live.map((s) => ({
          key: s.key,
          label: s.label,
          color: s.color,
          value: `${(s.share * 100).toFixed(1)}%`,
        }))}
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: our own six-source breakdown</span>
        <span className="opacity-50">·</span>
        <span>Percentages are the share of the whole window, not of the last day.</span>
        <SourceCoverageNote meta={breakdown?.meta} />
      </div>
    </Card>
  );
});
