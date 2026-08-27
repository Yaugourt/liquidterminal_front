"use client";

import { memo, useId, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartError, ChartLoading, chartPalette , rechartsGridDefaults } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { toQuarters, useFeeRevenueHistory, type RevenueQuarter } from "@/services/market/fundamentals";
import { SeriesLegend } from "./SeriesLegend";

/**
 * Protocol revenue by calendar quarter.
 *
 * The unit an equity reader compares in. Daily revenue is too noisy to carry a
 * trend and monthly still tracks the crypto cycle more than the business, so
 * quarters are where growth becomes a claim rather than a shape.
 *
 * The bar is total fees, split into what was kept and what was paid out, which
 * makes the two questions readable at once: is the venue growing, and is it
 * keeping the same share while it does.
 *
 * The running quarter is drawn hollow and excluded from every growth figure.
 * A quarter that is three weeks old always looks like a collapse next to a
 * finished one, and that comparison is the most common way this chart gets
 * misread.
 */

const formatUsdAxis = (value: number): string =>
  value >= 1e9 ? compactUsd(value, { decimals: 1 }) : compactUsd(value, { decimals: 0, fallback: "$0" });

const signedPct = (value: number): string => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(0)}%`;

const QuarterTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: RevenueQuarter }[];
}) => {
  const q = active ? payload?.[0]?.payload : undefined;
  if (!q) return null;

  const margin = q.fees > 0 ? q.revenue / q.fees : null;

  return (
    <div className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[180px]">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {q.label}
        </span>
        {q.partial && (
          <span className="text-[9px] px-1 py-px rounded bg-surface-2 text-text-tertiary border border-border-subtle">
            {q.days}d so far
          </span>
        )}
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: chartPalette.accent }} />
            Revenue
          </span>
          <span className="text-[11.5px] text-text-primary mono tabular-nums">
            {compactUsd(q.revenue)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: chartPalette.violet }} />
            Paid out
          </span>
          <span className="text-[11.5px] text-text-primary mono tabular-nums">
            {compactUsd(q.fees - q.revenue)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1.5 mt-1 border-t border-border-subtle">
          <span className="text-[11px] text-text-tertiary">Margin</span>
          <span className="text-[11.5px] text-text-secondary mono tabular-nums">
            {margin == null ? "—" : `${(margin * 100).toFixed(1)}%`}
          </span>
        </div>
        {q.qoq != null && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-text-tertiary">vs prior quarter</span>
            <span
              className={`text-[11.5px] mono tabular-nums ${
                q.qoq >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {signedPct(q.qoq)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const QuarterlyRevenueCard = memo(function QuarterlyRevenueCard() {
  const uid = useId().replace(/:/g, "");
  const { days, isLoading, error } = useFeeRevenueHistory();

  const quarters = useMemo(() => toQuarters(days), [days]);

  const rows = useMemo(
    () => quarters.map((q) => ({ ...q, paidOut: Math.max(0, q.fees - q.revenue) })),
    [quarters]
  );

  /** Growth over the last four completed quarters, annual-report style. */
  const summary = useMemo(() => {
    const complete = quarters.filter((q) => !q.partial);
    const last = complete[complete.length - 1] ?? null;
    const prior = complete[complete.length - 2] ?? null;
    const yearAgo = complete[complete.length - 5] ?? null;

    return {
      last,
      qoq: last?.qoq ?? null,
      yoy:
        last && yearAgo && yearAgo.revenue > 0
          ? (last.revenue - yearAgo.revenue) / yearAgo.revenue
          : null,
      priorLabel: prior?.label ?? null,
    };
  }, [quarters]);

  const isEmpty = !isLoading && !error && rows.length === 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <BarChart3 size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Quarterly Revenue</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono ml-auto">
          {rows.length} quarters
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px bg-border-subtle">
        {[
          {
            // Fixed label with the quarter in the sub line: "Q2 26 revenue"
            // does not fit a third of a 375px card and truncates to "Q2 26 REVE…".
            label: "Revenue",
            value: summary.last ? compactUsd(summary.last.revenue) : "—",
            sub: summary.last ? `${summary.last.label} · last complete` : "no closed quarter",
            tone: "" as const,
          },
          {
            label: "QoQ",
            value: summary.qoq == null ? "—" : signedPct(summary.qoq),
            sub: summary.priorLabel ? `vs ${summary.priorLabel}` : "needs two quarters",
            tone: summary.qoq == null ? "" : summary.qoq >= 0 ? "text-success" : "text-danger",
          },
          {
            label: "YoY",
            value: summary.yoy == null ? "—" : signedPct(summary.yoy),
            sub: summary.yoy == null ? "needs five quarters" : "same quarter last year",
            tone: summary.yoy == null ? "" : summary.yoy >= 0 ? "text-success" : "text-danger",
          },
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
        ) : isLoading && rows.length === 0 ? (
          <ChartLoading />
        ) : isEmpty ? (
          <div className="h-[220px] grid place-items-center text-[12px] text-text-tertiary">
            No quarter closed yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={rows}
              margin={{ top: 6, right: 10, bottom: 0, left: 0 }}
              barCategoryGap="22%"
              maxBarSize={46}
            >
              <defs>
                <linearGradient id={`q-rev-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.accent} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={chartPalette.accent} stopOpacity={0.5} />
                </linearGradient>
                <linearGradient id={`q-out-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.violet} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={chartPalette.violet} stopOpacity={0.32} />
                </linearGradient>
              </defs>
              <CartesianGrid {...rechartsGridDefaults} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={8}
              />
              <YAxis
                tickFormatter={(v) => formatUsdAxis(Number(v))}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} content={<QuarterTooltip />} />
              <Bar dataKey="revenue" stackId="q" isAnimationActive={false}>
                {rows.map((row) => (
                  <Cell
                    key={`rev-${row.label}`}
                    fill={row.partial ? "transparent" : `url(#q-rev-${uid})`}
                    stroke={chartPalette.accent}
                    strokeWidth={row.partial ? 1 : 0.5}
                    strokeOpacity={row.partial ? 0.8 : 0.4}
                    strokeDasharray={row.partial ? "3 3" : undefined}
                  />
                ))}
              </Bar>
              <Bar dataKey="paidOut" stackId="q" isAnimationActive={false} radius={[3, 3, 0, 0]}>
                {rows.map((row) => (
                  <Cell
                    key={`out-${row.label}`}
                    fill={row.partial ? "transparent" : `url(#q-out-${uid})`}
                    stroke={chartPalette.violet}
                    strokeWidth={row.partial ? 1 : 0.5}
                    strokeOpacity={row.partial ? 0.6 : 0.4}
                    strokeDasharray={row.partial ? "3 3" : undefined}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <SeriesLegend
        items={[
          { key: "revenue", label: "Protocol revenue", color: chartPalette.accent, shape: "bar" },
          { key: "paidOut", label: "Paid out", color: chartPalette.violet, shape: "bar" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: DefiLlama daily series, aggregated to calendar quarters</span>
        <span className="opacity-50">·</span>
        <span>The hollow bar is the running quarter and is excluded from QoQ and YoY.</span>
      </div>
    </Card>
  );
});
