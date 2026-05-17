"use client";

import { memo, useCallback, useEffect, useId, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartColors } from "./chartTheme";

export interface HistogramDataPoint {
  time: number;
  value: number;
  color?: string;
}

interface AuroraHistogramChartProps {
  data: HistogramDataPoint[];
  defaultColor?: string;
  formatValue?: (value: number) => string;
  formatTime?: (time: number) => string;
  onCrosshairMove?: (value: number | null, time: number | null) => void;
  /**
   * Corner radius for the top of each bar (px). Defaults to 2 which works well
   * at low bar widths; raise to 4 for chunkier, more decorative bars.
   */
  barRadius?: number;
  /** Width reserved for Y-axis labels in px. Defaults to 48. */
  yAxisWidth?: number;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function defaultFormatTime(ms: number) {
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TooltipPayloadItem {
  value?: number | string;
  payload?: HistogramDataPoint & { color?: string };
}

interface AuroraTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  defaultColor: string;
  formatValue?: (value: number) => string;
  formatTime: (time: number) => string;
}

function AuroraBarTooltip({
  active,
  payload,
  label,
  defaultColor,
  formatValue,
  formatTime,
}: AuroraTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const ts = Number(label);
  const first = payload[0];
  const raw = first?.value;
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) return null;
  const color = first?.payload?.color ?? defaultColor;

  return (
    <div className="rounded-xl border border-border-hover bg-brand-main/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[140px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {formatTime(ts)}
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.45)}` }}
        />
        <span className="font-semibold text-text-primary tabular-nums">
          {formatValue ? formatValue(value) : value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

const AuroraHistogramChartComponent = ({
  data,
  defaultColor = chartColors.rose,
  formatValue,
  formatTime,
  onCrosshairMove,
  barRadius = 2,
  yAxisWidth = 48,
}: AuroraHistogramChartProps) => {
  const uid = useId().replace(/:/g, "");
  const gradientId = `aurora-bar-${uid}`;

  const sorted = useMemo(
    () => [...data].sort((a, b) => a.time - b.time),
    [data]
  );

  const formatTimeFn = formatTime ?? defaultFormatTime;

  const handleMouseMove = useCallback(
    (state: unknown) => {
      if (!onCrosshairMove) return;
      const s = state as { activeTooltipIndex?: number } | null | undefined;
      if (!s || typeof s.activeTooltipIndex !== "number") return;
      const point = sorted[s.activeTooltipIndex];
      if (!point) {
        onCrosshairMove(null, null);
        return;
      }
      onCrosshairMove(point.value, point.time);
    },
    [onCrosshairMove, sorted]
  );

  const handleMouseLeave = useCallback(() => {
    onCrosshairMove?.(null, null);
  }, [onCrosshairMove]);

  useEffect(() => {
    onCrosshairMove?.(null, null);
  }, [data, onCrosshairMove]);

  return (
    <div className="w-full h-full" style={{ minHeight: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.75)" stopOpacity={0.75} />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0.2} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 5"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
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
          <YAxis
            tickFormatter={(v) =>
              formatValue ? formatValue(Number(v)) : Number(v).toLocaleString()
            }
            tick={{ fill: chartColors.textMuted, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={yAxisWidth}
            domain={[0, "auto"]}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={
              <AuroraBarTooltip
                defaultColor={defaultColor}
                formatValue={formatValue}
                formatTime={formatTimeFn}
              />
            }
          />
          <Bar
            dataKey="value"
            radius={[barRadius, barRadius, 0, 0]}
            isAnimationActive={false}
          >
            {sorted.map((entry, index) => {
              const fill = entry.color ?? defaultColor;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={fill}
                  fillOpacity={0.85}
                  stroke={fill}
                  strokeOpacity={0.4}
                  strokeWidth={1}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AuroraHistogramChart = memo(AuroraHistogramChartComponent);
