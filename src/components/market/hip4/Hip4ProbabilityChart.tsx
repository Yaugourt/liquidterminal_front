"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { chartPalette, chartColors, TimeframeTabs } from "@/components/common";
import type { Timeframe } from "@/lib/timeframe";
import {
  buildProbabilitySeries,
  buildProbabilitySeriesFromCandles,
  type ProbSeriesDef,
} from "@/lib/hip4/probability-series";
import type { Hip4FillRow, Hip4Candle } from "@/services/indexer/hip4";

interface Hip4ProbabilityChartProps {
  title: string;
  defs: ProbSeriesDef[];
  fillsByCoin: Record<string, Hip4FillRow[]>;
  isLoading: boolean;
  error?: Error | null;
  /** Clean OHLC source for live coins — preferred over the fills reconstruction
   *  when present and non-empty. */
  candlesByCoin?: Record<string, Hip4Candle[]>;
  /** Optional timeframe selector (drives the candle window upstream). */
  timeframe?: Timeframe;
  onTimeframeChange?: (tf: Timeframe) => void;
  timeframeOptions?: Timeframe[];
}

function fmtTime(t: number, bucketMs: number): string {
  const d = new Date(t);
  if (bucketMs >= 24 * 3_600_000) {
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

interface ColoredSeries {
  key: string;
  label: string;
  color: string;
}

interface ProbTooltipProps {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number | string | null }[];
  label?: string | number;
  colored: ColoredSeries[];
  bucketMs: number;
}

function ProbTooltip({ active, payload, label, colored, bucketMs }: ProbTooltipProps) {
  if (!active || !payload || payload.length === 0 || label == null) return null;
  return (
    <div className="rounded-lg border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl min-w-[180px]">
      <div className="mono text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
        {fmtTime(Number(label), bucketMs)}
      </div>
      {colored.map((s) => {
        const p = payload.find((x) => x.dataKey === s.key);
        if (!p || p.value == null) return null;
        return (
          <div key={s.key} className="flex items-center justify-between gap-3 text-[11.5px] mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-text-secondary truncate max-w-[120px]">{s.label}</span>
            </div>
            <span className="mono font-semibold text-text-primary">{Number(p.value).toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Multi-line implied-probability chart (one line per outcome) reconstructed
 * from the fills feed — the prediction-market "odds over time" view for markets
 * with no underlying price chart (NBA, CPI, Fed). Colors mirror
 * `chartPalette.multiSeries`, the same palette the outcome bars use on the card.
 */
export function Hip4ProbabilityChart({
  title,
  defs,
  fillsByCoin,
  isLoading,
  error,
  candlesByCoin,
  timeframe,
  onTimeframeChange,
  timeframeOptions,
}: Hip4ProbabilityChartProps) {
  const hasCandles =
    !!candlesByCoin && Object.values(candlesByCoin).some((c) => c && c.length > 0);
  const { rows, series, bucketMs } = useMemo(
    () =>
      hasCandles
        ? buildProbabilitySeriesFromCandles(candlesByCoin!, defs)
        : buildProbabilitySeries(fillsByCoin, defs),
    [hasCandles, candlesByCoin, fillsByCoin, defs]
  );

  const showTabs = !!timeframe && !!onTimeframeChange && !!timeframeOptions?.length;

  const colored = useMemo<ColoredSeries[]>(
    () =>
      series.map((s, i) => ({
        ...s,
        color: chartPalette.multiSeries[i % chartPalette.multiSeries.length],
      })),
    [series]
  );

  const lastVals = useMemo(() => {
    const out: Record<string, number | null> = {};
    for (const s of series) {
      let v: number | null = null;
      for (let i = rows.length - 1; i >= 0; i--) {
        const r = rows[i][s.key];
        if (r != null) {
          v = r;
          break;
        }
      }
      out[s.key] = v;
    }
    return out;
  }, [rows, series]);

  // A `dot={false}` line needs ≥2 points to draw anything; a single-trade
  // market would otherwise render a blank plot under a confident legend value.
  const drawable = useMemo(
    () =>
      colored.some(
        (s) => rows.reduce((n, r) => n + (r[s.key] != null ? 1 : 0), 0) >= 2
      ),
    [rows, colored]
  );

  return (
    <Card className="w-full h-full min-h-[480px] flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Activity size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary truncate">{title}</h3>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {showTabs && (
            <TimeframeTabs
              options={timeframeOptions!}
              value={timeframe!}
              onChange={onTimeframeChange!}
            />
          )}
          <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-text-tertiary sm:inline">
            Implied probability
          </span>
        </div>
      </div>

      {/* Legend with current odds */}
      <div className="px-3.5 py-2 flex flex-wrap gap-1.5">
        {colored.map((s) => (
          <span
            key={s.key}
            className="flex items-center gap-1.5 rounded border border-border-subtle bg-surface-2 px-2 py-0.5"
          >
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-[10.5px] font-semibold text-text-secondary truncate max-w-[150px]">
              {s.label}
            </span>
            <span className="mono text-[10.5px] font-semibold text-text-primary">
              {lastVals[s.key] != null ? `${lastVals[s.key]!.toFixed(0)}%` : "—"}
            </span>
          </span>
        ))}
      </div>

      <div className="flex-1 min-h-0 px-2 pb-3">
        {isLoading && rows.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <InlineSpinner className="h-5 w-5 text-brand" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-[11px] text-danger">
            Failed to load probability history
          </div>
        ) : !drawable ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center px-6">
            <p className="text-[12px] font-semibold text-text-secondary">Not enough trade history</p>
            <p className="text-[11px] text-text-tertiary max-w-xs">
              This market hasn&apos;t traded enough to plot an odds curve. Current odds are
              shown above; check recent fills below.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 5" stroke={chartColors.gridLine} vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => fmtTime(Number(v), bucketMs)}
                tick={{ fill: chartColors.textMuted, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={50}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: chartColors.textMuted, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                content={<ProbTooltip colored={colored} bucketMs={bucketMs} />}
                cursor={{ stroke: chartPalette.accent, strokeOpacity: 0.25, strokeDasharray: "3 3" }}
              />
              {colored.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
