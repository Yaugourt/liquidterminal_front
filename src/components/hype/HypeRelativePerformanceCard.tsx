"use client";

import { memo, useMemo } from "react";
import { Activity } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  ChartLoading,
  chartPalette,
  rechartsGridDefaults,
  rechartsXAxisPadding,
} from "@/components/common";
import { useRelativePerformance, type RelativePerformancePoint } from "@/services/market/token";

/**
 * HYPE relative performance — the native asset rebased against the majors.
 *
 * Every series starts at 100 on the first day of the window, so the lines read
 * as pure outperformance: the vertical gap at any point is the percentage lead
 * or lag versus where each coin began. HYPE carries the brand accent; BTC/ETH/
 * SOL sit in neutral chart tones as the backdrop it is measured against.
 */

/** Series → color + label. HYPE keeps the brand accent; the majors are muted. */
const SERIES = [
  { key: "HYPE", color: chartPalette.accent },
  { key: "BTC", color: chartPalette.gold },
  { key: "ETH", color: chartPalette.violet },
  { key: "SOL", color: chartPalette.down },
] as const;

const formatDay = (ms: number): string =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const formatFullDay = (ms: number): string =>
  new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const RelativeTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: RelativePerformancePoint }[];
}) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[150px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {formatFullDay(point.time)}
      </div>
      <div className="mt-1.5 space-y-0.5">
        {SERIES.map(({ key, color }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {key}
            </span>
            <span className="text-[11.5px] text-text-primary mono tabular-nums">
              {point[key].toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HypeRelativePerformanceCard = memo(function HypeRelativePerformanceCard() {
  const { series, isLoading, error } = useRelativePerformance();

  // A comparison needs at least two aligned points to draw a slope.
  const hasData = series.length >= 2;

  const yDomain = useMemo<[number, number]>(() => {
    if (!hasData) return [80, 120];
    let min = Infinity;
    let max = -Infinity;
    for (const point of series) {
      for (const { key } of SERIES) {
        const v = point[key];
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    // A little breathing room above and below the extremes.
    const pad = Math.max((max - min) * 0.08, 1);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [series, hasData]);

  // Self-gate: nothing to compare on error or with too few aligned points.
  if (error || (!isLoading && !hasData)) return null;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Activity size={13} className="text-brand" />
        </span>
        <div className="flex flex-col">
          <h3 className="text-[13px] font-semibold text-text-primary leading-tight">
            Relative performance
          </h3>
          <span className="text-[10.5px] text-text-tertiary leading-tight">
            HYPE vs BTC / ETH / SOL, rebased to 100 (90d)
          </span>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
          {SERIES.map(({ key, color }) => (
            <span key={key} className="flex items-center gap-1.5 text-[10.5px] text-text-secondary">
              <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: color }} />
              {key}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 px-2 pt-3 pb-2">
        {isLoading && !hasData ? (
          <ChartLoading />
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
                domain={yDomain}
                tickFormatter={(v) => `${Math.round(Number(v))}`}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.12)" }}
                content={<RelativeTooltip />}
              />
              {SERIES.map(({ key, color }) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={key === "HYPE" ? 1.8 : 1.2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>BTC/ETH/SOL from HL perp candles · rebased to 100</span>
        {hasData && (
          <>
            <span className="opacity-50">·</span>
            <span>{`${series.length} days`}</span>
          </>
        )}
      </div>
    </Card>
  );
});
