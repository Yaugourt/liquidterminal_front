"use client";

import { memo, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
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
import { ChartError, ChartLoading, PeriodSelector, chartPalette , rechartsXAxisPadding , rechartsGridDefaults } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { HYPE_MAX_SUPPLY, HYPE_SPOT_COIN } from "@/services/market/hype";
import { useTokenCandles } from "@/services/market/token";
import {
  toMultipleSeries,
  useFeeRevenueHistory,
  type MultiplePoint,
} from "@/services/market/fundamentals";

/**
 * The multiple over time — is the token getting cheaper against its own
 * earnings, or is the price simply following them.
 *
 * This is the chart that separates a re-rating from growth. Revenue rising
 * while the multiple holds means the market is paying the same price for a
 * bigger business. Revenue rising while the multiple compresses means it is
 * paying less for it, which is a different claim entirely and the one worth
 * arguing about.
 *
 * Fully diluted only, and the footer says so. A historical market cap needs
 * the float as it stood on the day; we hold today's and no history of it, so a
 * circulating series would price last year's close against this year's supply
 * and read as a compression that never happened. Max supply is fixed at
 * genesis, which makes the diluted basis exact rather than approximate.
 */

const METRICS = ["P/F", "P/E"] as const;
type Metric = (typeof METRICS)[number];

/** 600 days requested: the candle feed caps out well before the fee history. */
const CANDLE_DAYS = 600;
const DAY_MS = 86_400_000;

const formatDay = (ms: number): string =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const formatFullDay = (ms: number): string =>
  new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const MultipleTooltip = ({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: { payload?: MultiplePoint }[];
  metric: Metric;
}) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;

  const value = metric === "P/F" ? point.priceToFees : point.priceToEarnings;

  return (
    <div className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[160px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {formatFullDay(point.time)}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[17px] font-semibold text-text-primary mono tabular-nums">
          {`${Math.round(value)}×`}
        </span>
        <span className="text-[11px] text-text-secondary">{metric} diluted</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-4">
        <span className="text-[11px] text-text-tertiary">FDV</span>
        <span className="text-[11.5px] text-text-secondary mono tabular-nums">
          {compactUsd(point.fdv)}
        </span>
      </div>
    </div>
  );
};

export const MultipleHistoryCard = memo(function MultipleHistoryCard() {
  const [metric, setMetric] = useState<Metric>("P/E");
  const { days, isLoading: loadingFees, error } = useFeeRevenueHistory();

  const startTime = useMemo(() => Date.now() - CANDLE_DAYS * DAY_MS, []);
  const { candles, isLoading: loadingCandles } = useTokenCandles({
    coin: HYPE_SPOT_COIN,
    interval: "1d",
    startTime,
  });

  /** Candles are stamped at the open of their UTC day, the same key the fee
   *  series uses, so the join needs no bucketing. */
  const closesByDay = useMemo(() => {
    const map = new Map<number, number>();
    for (const candle of candles) {
      const close = parseFloat(candle.c);
      if (Number.isFinite(close)) {
        map.set(Math.floor(candle.t / DAY_MS) * DAY_MS, close);
      }
    }
    return map;
  }, [candles]);

  const series = useMemo(
    () => toMultipleSeries(days, closesByDay, HYPE_MAX_SUPPLY),
    [days, closesByDay]
  );

  const stats = useMemo(() => {
    if (series.length === 0) return { current: null, min: null, max: null, average: null };
    const values = series.map((p) => (metric === "P/F" ? p.priceToFees : p.priceToEarnings));
    return {
      current: values[values.length - 1],
      min: Math.min(...values),
      max: Math.max(...values),
      average: values.reduce((sum, v) => sum + v, 0) / values.length,
    };
  }, [series, metric]);

  const dataKey = metric === "P/F" ? "priceToFees" : "priceToEarnings";
  const isLoading = (loadingFees || loadingCandles) && series.length === 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <TrendingUp size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Multiple Over Time</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
          diluted
        </span>
        <PeriodSelector
          className="ml-auto"
          selected={metric}
          onChange={setMetric}
          options={METRICS}
          variant="aurora"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-subtle">
        {[
          // "at the last close" rather than "now": the series ends on the last
          // completed day, so this sits a price move away from the live card above.
          { label: "Latest", value: stats.current, sub: "at the last close" },
          { label: "Average", value: stats.average, sub: "over the series" },
          { label: "Low", value: stats.min, sub: "cheapest close" },
          { label: "High", value: stats.max, sub: "richest close" },
        ].map((cell) => (
          <div key={cell.label} className="bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
              {cell.label}
            </div>
            <div className="text-[16px] font-semibold text-text-primary mono mt-1">
              {cell.value == null ? "—" : `${Math.round(cell.value)}×`}
            </div>
            <div className="text-[10.5px] text-text-tertiary/80 mt-0.5">{cell.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 px-2 pt-3 pb-2">
        {error ? (
          <ChartError />
        ) : isLoading ? (
          <ChartLoading />
        ) : series.length === 0 ? (
          <div className="h-[240px] grid place-items-center px-6 text-center text-[12px] text-text-tertiary">
            A trailing-twelve-month multiple needs a year of fees and a price on the same day.
            The two series do not overlap yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={series} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
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
                tickFormatter={(v) => `${Math.round(Number(v))}×`}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              {stats.average != null && (
                <ReferenceLine
                  y={stats.average}
                  stroke={chartPalette.gold}
                  strokeDasharray="4 4"
                  strokeOpacity={0.45}
                />
              )}
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.12)" }}
                content={<MultipleTooltip metric={metric} />}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
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
        <span>{`FDV = close × ${(HYPE_MAX_SUPPLY / 1e9).toFixed(0)}B max supply, fixed at genesis`}</span>
        <span className="opacity-50">·</span>
        <span>
          Diluted only: we hold today&apos;s float and no history of it, and pricing past closes
          against it would draw a compression that never happened.
        </span>
        {series.length > 0 && (
          <>
            <span className="opacity-50">·</span>
            <span>{`${series.length} days`}</span>
          </>
        )}
      </div>
    </Card>
  );
});
