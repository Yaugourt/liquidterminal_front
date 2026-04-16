"use client";

import { memo, useCallback, useEffect, useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartColors } from "./chartTheme";

export interface ChartDataPoint {
  time: number;
  value: number;
}

interface AuroraAreaChartProps {
  data: ChartDataPoint[];
  height?: number;
  lineColor?: string;
  /**
   * Optional override for the top gradient color. If omitted, the component
   * derives it from `lineColor` with ~35% opacity.
   */
  areaTopColor?: string;
  areaBottomColor?: string;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  formatTime?: (time: number) => string;
  onCrosshairMove?: (value: number | null, time: number | null) => void;
  /**
   * Minimum number of Y-axis tick labels to reserve horizontal room for.
   * Defaults to 60px — tuned for the current chart footprint.
   */
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
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface TooltipPayloadItem {
  value?: number | string;
  payload?: ChartDataPoint;
}

interface AuroraTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  color: string;
  glow: string;
  formatValue?: (value: number) => string;
  formatTime: (time: number) => string;
}

function AuroraTooltip({
  active,
  payload,
  label,
  color,
  glow,
  formatValue,
  formatTime,
}: AuroraTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const ts = Number(label);
  const raw = payload[0]?.value;
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) return null;

  return (
    <div className="rounded-xl border border-border-hover bg-[#0B0E14]/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[140px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {formatTime(ts)}
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${glow}` }}
        />
        <span className="font-semibold text-white tabular-nums">
          {formatValue ? formatValue(value) : value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

const AuroraAreaChartComponent = ({
  data,
  height,
  lineColor = chartColors.cyan,
  areaTopColor,
  areaBottomColor = "transparent",
  showGrid = true,
  formatValue,
  formatTime,
  onCrosshairMove,
  yAxisWidth = 60,
}: AuroraAreaChartProps) => {
  const uid = useId().replace(/:/g, "");
  const gradientId = `aurora-grad-${uid}`;

  const sorted = useMemo(
    () => [...data].sort((a, b) => a.time - b.time),
    [data]
  );

  const topColor = areaTopColor ?? hexToRgba(lineColor, 0.45);

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

  // Reset any lingering crosshair state when data changes to a different series.
  useEffect(() => {
    onCrosshairMove?.(null, null);
    // Intentionally depend only on reference equality of the data array so
    // consumers that memoize their data array don't get spurious resets.
  }, [data, onCrosshairMove]);

  return (
    <div
      className="w-full h-full"
      style={{ minHeight: height ?? 200, height: height ?? "100%" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={sorted}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={topColor} stopOpacity={1} />
              <stop offset="100%" stopColor={areaBottomColor} stopOpacity={0} />
            </linearGradient>
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
          <YAxis
            tickFormatter={(v) =>
              formatValue ? formatValue(Number(v)) : Number(v).toLocaleString()
            }
            tick={{ fill: chartColors.textMuted, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={yAxisWidth}
            domain={["dataMin", "dataMax"]}
          />
          <Tooltip
            cursor={{
              stroke: hexToRgba(lineColor, 0.35),
              strokeDasharray: "3 3",
              strokeWidth: 1,
            }}
            content={
              <AuroraTooltip
                color={lineColor}
                glow={hexToRgba(lineColor, 0.35)}
                formatValue={formatValue}
                formatTime={formatTimeFn}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            activeDot={{
              r: 4,
              fill: lineColor,
              stroke: chartColors.labelBg,
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AuroraAreaChart = memo(AuroraAreaChartComponent);
