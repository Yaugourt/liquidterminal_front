"use client";

import { memo, useId, useMemo } from "react";
import { Repeat } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { ChartError, ChartLoading, chartPalette } from "@/components/common";
import { compactHype, compactUsd } from "@/lib/formatters/numberFormatting";
import { useAfBuybacks } from "@/services/market/hype";
import { useRevenueBreakdown } from "@/services/market/revenue";

/**
 * The buyback, day by day, against the revenue that funds it.
 *
 * Bars are the Assistance Fund's actual HYPE purchases aggregated per UTC day
 * from on-chain fills. The line is protocol revenue on the same days from our
 * own breakdown. Where the line runs above the bars the buyback is lagging the
 * revenue it draws on; where they track, the flywheel is turning at full rate.
 *
 * Both series are measured rather than modelled, and both are cut to the same
 * days, so the gap between them is a real observation and not a mismatch of
 * windows. The series is short on purpose: the fund's fills are pulled one UTC
 * day per request, and a deeper history would cost a request per extra day.
 */

const formatUsdAxis = (value: number): string =>
  compactUsd(value, { decimals: 0, fallback: "$0" });

// UTC: both feeds aggregate by UTC day, so a local label would name the wrong one.
const formatDay = (ms: number): string =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

interface DayPoint {
  time: number;
  buyback: number;
  hype: number;
  revenue: number | null;
  coverage: number | null;
}

const DayTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: DayPoint }[];
}) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[190px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {new Date(point.time).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })}
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: chartPalette.accent }} />
            Bought back
          </span>
          <span className="text-[11.5px] text-text-primary mono tabular-nums">
            {compactUsd(point.buyback)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] text-text-tertiary pl-3">in HYPE</span>
          <span className="text-[11.5px] text-text-secondary mono tabular-nums">
            {compactHype(point.hype)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: chartPalette.gold }} />
            Protocol revenue
          </span>
          <span className="text-[11.5px] text-text-primary mono tabular-nums">
            {point.revenue == null ? "—" : compactUsd(point.revenue)}
          </span>
        </div>
        {point.coverage != null && (
          <div className="flex items-center justify-between gap-4 pt-1.5 mt-1 border-t border-border-subtle">
            <span className="text-[11px] text-text-tertiary">Bought back / revenue</span>
            <span className="text-[11.5px] font-semibold text-text-primary mono tabular-nums">
              {`${(point.coverage * 100).toFixed(0)}%`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const BuybackHistoryCard = memo(function BuybackHistoryCard() {
  const uid = useId().replace(/:/g, "");
  const { data: buybacks, isLoading: loadingBuybacks, error: buybackError } = useAfBuybacks();
  const { breakdown, isLoading: loadingRevenue, error: revenueError } = useRevenueBreakdown("30d");

  const revenueByDay = useMemo(() => {
    const map = new Map<number, number>();
    for (const day of breakdown?.days ?? []) {
      map.set(Date.parse(`${day.date}T00:00:00Z`), day.total);
    }
    return map;
  }, [breakdown]);

  /** Completed days only: the running day holds part of a session on both
   *  sides and would draw as a slump on the bar and the line at once. */
  const data: DayPoint[] = useMemo(() => {
    const daily = buybacks?.daily ?? [];
    const completed = daily.length > 1 ? daily.slice(0, -1) : daily;
    return completed.map((d) => {
      const revenue = revenueByDay.get(d.time) ?? null;
      return {
        time: d.time,
        buyback: d.usd,
        hype: d.hype,
        revenue,
        coverage: revenue != null && revenue > 0 ? d.usd / revenue : null,
      };
    });
  }, [buybacks, revenueByDay]);

  /** Totals over the days present on both series — the only honest basis for
   *  a ratio here, since the two feeds have different depths. */
  const matched = useMemo(() => {
    const both = data.filter((d) => d.revenue != null);
    const buyback = both.reduce((sum, d) => sum + d.buyback, 0);
    const revenue = both.reduce((sum, d) => sum + (d.revenue ?? 0), 0);
    const hype = both.reduce((sum, d) => sum + d.hype, 0);
    return {
      days: both.length,
      buyback,
      revenue,
      hype,
      payout: revenue > 0 ? buyback / revenue : null,
    };
  }, [data]);

  const isLoading = (loadingBuybacks || loadingRevenue) && data.length === 0;
  const error = buybackError ?? revenueError;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Repeat size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Buyback vs Revenue</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono ml-auto">
          {matched.days > 0 ? `${matched.days} completed days` : "daily"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-subtle">
        {[
          {
            label: "Bought back",
            value: compactUsd(matched.buyback),
            sub: "on-chain fills",
          },
          {
            label: "Revenue",
            value: compactUsd(matched.revenue),
            sub: "same days",
          },
          {
            label: "Payout",
            value: matched.payout == null ? "—" : `${(matched.payout * 100).toFixed(0)}%`,
            sub: "of revenue repurchased",
          },
          {
            label: "HYPE taken",
            value: matched.hype > 0 ? compactHype(matched.hype) : "—",
            sub: "off the market",
          },
        ].map((cell) => (
          <div key={cell.label} className="bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
              {cell.label}
            </div>
            <div className="text-[16px] font-semibold text-text-primary mono mt-1">{cell.value}</div>
            <div className="text-[10.5px] text-text-tertiary/80 mt-0.5">{cell.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 px-2 pt-3 pb-2">
        {error ? (
          <ChartError />
        ) : isLoading ? (
          <ChartLoading />
        ) : data.length === 0 ? (
          <div className="h-[220px] grid place-items-center text-[12px] text-text-tertiary">
            No completed buyback day yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart
              data={data}
              margin={{ top: 6, right: 10, bottom: 0, left: 0 }}
              barCategoryGap="28%"
              maxBarSize={30}
            >
              <defs>
                <linearGradient id={`bb-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.accent} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={chartPalette.accent} stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 5" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={formatDay}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(v) => formatUsdAxis(Number(v))}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} content={<DayTooltip />} />
              <Bar
                dataKey="buyback"
                fill={`url(#bb-${uid})`}
                stroke={chartPalette.accent}
                strokeWidth={0.5}
                strokeOpacity={0.4}
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={chartPalette.gold}
                strokeWidth={1.8}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Bars: Assistance Fund fills · line: our six-source revenue</span>
        {matched.hype > 0 && (
          <>
            <span className="opacity-50">·</span>
            <span>{`Avg fill $${(matched.buyback / matched.hype).toFixed(2)}`}</span>
          </>
        )}
        <span className="opacity-50">·</span>
        <span>
          Totals cover only the days both feeds report, so the payout ratio compares like with
          like.
        </span>
      </div>
    </Card>
  );
});
