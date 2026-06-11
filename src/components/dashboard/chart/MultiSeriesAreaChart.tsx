"use client";

import { memo, useCallback, useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartColors } from "@/components/common";

/**
 * One time-series fed to the multi-series chart.
 *
 * `axis` selects which price scale the series binds to:
 *  - "left"  → primary axis (e.g. Bridge TVL, billions)
 *  - "right" → secondary axis (e.g. Fees, millions)
 *
 * This dual-axis split is what keeps small-scale series readable next to
 * large-scale ones — the analytics-dashboard standard.
 */
export interface MultiSeries {
  id: string;
  name: string;
  color: string;
  axis: "left" | "right";
  data: { time: number; value: number }[];
  /** Per-axis value formatter (also used for the tooltip). */
  formatValue: (value: number) => string;
}

interface MultiSeriesAreaChartProps {
  series: MultiSeries[];
  height?: number;
  showGrid?: boolean;
  formatTime?: (time: number) => string;
  /** Reports the hovered timestamp (null when the pointer leaves the plot). */
  onCrosshairMove?: (time: number | null) => void;
}

/** Internal row shape: one entry per timestamp with a column per series id. */
type ChartRow = { time: number } & Record<string, number | undefined>;

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function defaultFormatTime(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: number | string;
}

interface MultiTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  series: MultiSeries[];
  formatTime: (time: number) => string;
}

function MultiSeriesTooltip({
  active,
  payload,
  label,
  series,
  formatTime,
}: MultiTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const ts = Number(label);

  return (
    <div className="rounded-lg border border-border-default bg-surface/95 backdrop-blur-md px-3 py-2.5 shadow-xl shadow-black/40 min-w-[160px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {Number.isFinite(ts) ? formatTime(ts) : ""}
      </div>
      <div className="mt-1.5 flex flex-col gap-1">
        {series.map((s) => {
          const item = payload.find((p) => p.dataKey === s.id);
          const raw = item?.value;
          const value = typeof raw === "number" ? raw : Number(raw);
          if (!Number.isFinite(value)) return null;
          return (
            <div key={s.id} className="flex items-center gap-2 text-[11px]">
              <span
                className="h-2 w-2 rounded-sm shrink-0"
                style={{ background: s.color }}
              />
              <span className="text-text-secondary">{s.name}</span>
              <span className="mono ml-auto font-semibold text-text-primary tabular-nums">
                {s.formatValue(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const MultiSeriesAreaChartComponent = ({
  series,
  height,
  showGrid = true,
  formatTime,
  onCrosshairMove,
}: MultiSeriesAreaChartProps) => {
  const uid = useId().replace(/:/g, "");
  const formatTimeFn = formatTime ?? defaultFormatTime;

  // Merge every series into a single row-per-timestamp dataset so Recharts
  // can render them on a shared X axis. Series may not share timestamps —
  // missing points stay `undefined` and Recharts connects across the gap.
  const rows = useMemo<ChartRow[]>(() => {
    const byTime = new Map<number, ChartRow>();
    for (const s of series) {
      for (const point of s.data) {
        const existing = byTime.get(point.time);
        if (existing) {
          existing[s.id] = point.value;
        } else {
          byTime.set(point.time, { time: point.time, [s.id]: point.value });
        }
      }
    }
    return Array.from(byTime.values()).sort((a, b) => a.time - b.time);
  }, [series]);

  const leftSeries = useMemo(
    () => series.filter((s) => s.axis === "left"),
    [series]
  );
  const rightSeries = useMemo(
    () => series.filter((s) => s.axis === "right"),
    [series]
  );

  const leftFormatter = leftSeries[0]?.formatValue;
  const rightFormatter = rightSeries[0]?.formatValue;

  const handleMouseMove = useCallback(
    (state: unknown) => {
      if (!onCrosshairMove) return;
      const s = state as { activeLabel?: number | string } | null | undefined;
      const ts = s?.activeLabel != null ? Number(s.activeLabel) : null;
      onCrosshairMove(ts != null && Number.isFinite(ts) ? ts : null);
    },
    [onCrosshairMove]
  );

  const handleMouseLeave = useCallback(() => {
    onCrosshairMove?.(null);
  }, [onCrosshairMove]);

  return (
    <div
      className="w-full h-full"
      style={{ minHeight: height ?? 200, height: height ?? "100%" }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 520, height: 200 }}
      >
        <AreaChart
          data={rows}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.id}
                id={`ms-grad-${uid}-${s.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={hexToRgba(s.color, 0.32)}
                  stopOpacity={1}
                />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 5"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
          )}

          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            scale="time"
            tickFormatter={formatTimeFn}
            tick={{ fill: chartColors.textMuted, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />

          {leftSeries.length > 0 && (
            <YAxis
              yAxisId="left"
              orientation="left"
              tickFormatter={(v) =>
                leftFormatter
                  ? leftFormatter(Number(v))
                  : Number(v).toLocaleString()
              }
              tick={{ fill: chartColors.textMuted, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={62}
              domain={["dataMin", "dataMax"]}
            />
          )}

          {rightSeries.length > 0 && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) =>
                rightFormatter
                  ? rightFormatter(Number(v))
                  : Number(v).toLocaleString()
              }
              tick={{ fill: chartColors.textMuted, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={62}
              domain={["dataMin", "dataMax"]}
            />
          )}

          <Tooltip
            cursor={{
              stroke: "rgba(255,255,255,0.18)",
              strokeDasharray: "3 3",
              strokeWidth: 1,
            }}
            content={
              <MultiSeriesTooltip series={series} formatTime={formatTimeFn} />
            }
          />

          {series.map((s) => (
            <Area
              key={s.id}
              yAxisId={s.axis}
              type="monotone"
              dataKey={s.id}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#ms-grad-${uid}-${s.id})`}
              isAnimationActive={false}
              connectNulls
              activeDot={{
                r: 4,
                fill: s.color,
                stroke: chartColors.labelBg,
                strokeWidth: 2,
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MultiSeriesAreaChart = memo(MultiSeriesAreaChartComponent);
