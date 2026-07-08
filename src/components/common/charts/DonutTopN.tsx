"use client";

import { useId, useState, type ReactNode } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { chartPalette } from "./chartTheme";

/**
 * DonutTopN — shared donut primitive for "Top N + Rest" charts.
 *
 * Consolidates the visual contract used by `BuildersConcentrationCard`,
 * `BuildersOverviewChart` (market/builders) and `Hip4MarketShareChart`.
 *
 * The Builders donut is the visual reference: `ActiveArc` (Sector +8 + halo
 * +10/+13 opacity 0.45) on hover, optional radial gradient fill, drop-shadow
 * on the active slice. `BuildersConcentrationCard` uses a simpler "dim-others"
 * variant when no ActiveArc is desired.
 *
 * The center label and legend are NOT rendered here — consumers own them so
 * they can layout the surrounding card freely. Pass `center` for the
 * absolute-positioned content (kept above the donut), and use the controlled
 * `activeIdx`/`onActiveChange` to sync the legend with the donut hover.
 */

export interface DonutSlice {
  /** Stable React key (slice address, name, id…). */
  key: string;
  /** Display name (used as nameKey by Recharts; not rendered by this primitive). */
  name: string;
  /** Slice raw value. Used for the angle, not formatted here. */
  value: number;
  /** Fill color — use `chartPalette.multiSeries[i]` to stay on-brand. */
  color: string;
}

export type DonutVariant = "active-arc" | "dim-others";

export interface DonutTopNProps {
  /** Slices in render order. Pass them already sorted + with `Rest` appended if needed. */
  data: DonutSlice[];
  /** Pixel size of the square that holds the donut (default `220`). */
  size?: number;
  /** Inner radius ratio (default `0.62`). */
  innerRadius?: number;
  /** Outer radius ratio (default `0.88`). */
  outerRadius?: number;
  /** Gap between slices in degrees (default `2`). */
  paddingAngle?: number;
  /** Controlled hover index. Pass with `onActiveChange` for full control. */
  activeIdx?: number | null;
  /** Hover change callback (controlled mode). If omitted the primitive owns the state. */
  onActiveChange?: (idx: number | null) => void;
  /**
   * Visual variant.
   *  - `"active-arc"` (default, Builders reference) — Sector +8 + halo on hover.
   *  - `"dim-others"` — non-hovered slices fade to opacity 0.3.
   */
  variant?: DonutVariant;
  /** Fill slices with a radial gradient (default `true`). */
  useGradient?: boolean;
  /** Drop-shadow on the active slice (default `true`). */
  activeGlow?: boolean;
  /** Absolute-positioned content (typically the center metric). */
  center?: ReactNode;
}

interface ActiveShapeProps {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
}

/** Builders-style active arc: thicker outer sector + halo ring. */
function ActiveArc({
  cx = 0,
  cy = 0,
  innerRadius = 0,
  outerRadius = 0,
  startAngle = 0,
  endAngle = 0,
  fill = chartPalette.white,
}: ActiveShapeProps) {
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 13}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.45}
      />
    </g>
  );
}

export function DonutTopN({
  data,
  size = 220,
  innerRadius = 0.62,
  outerRadius = 0.88,
  paddingAngle = 2,
  activeIdx: controlledActive,
  onActiveChange,
  variant = "active-arc",
  useGradient = true,
  activeGlow = true,
  center,
}: DonutTopNProps) {
  const layoutId = useId().replace(/:/g, "");
  const [uncontrolledActive, setUncontrolledActive] = useState<number | null>(null);
  const isControlled = onActiveChange !== undefined;
  const activeIdx = isControlled ? controlledActive ?? null : uncontrolledActive;

  const setActive = (idx: number | null) => {
    if (isControlled) onActiveChange?.(idx);
    else setUncontrolledActive(idx);
  };

  return (
    <div
      className="relative max-w-full"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {useGradient && (
            <defs>
              {data.map((s, i) => (
                <radialGradient
                  key={s.key}
                  id={`donutTopN-${layoutId}-${i}`}
                  cx="50%"
                  cy="50%"
                  r="75%"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.65} />
                </radialGradient>
              ))}
            </defs>
          )}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={`${innerRadius * 100}%`}
            outerRadius={`${outerRadius * 100}%`}
            paddingAngle={paddingAngle}
            startAngle={90}
            endAngle={-270}
            activeShape={variant === "active-arc" ? ActiveArc : undefined}
            onMouseEnter={(_, idx) => setActive(idx)}
            onMouseLeave={() => setActive(null)}
            stroke="transparent"
            isAnimationActive={false}
          >
            {data.map((s, i) => {
              const dimOthers =
                variant === "dim-others" &&
                activeIdx != null &&
                activeIdx !== i;
              return (
                <Cell
                  key={s.key}
                  fill={useGradient ? `url(#donutTopN-${layoutId}-${i})` : s.color}
                  opacity={dimOthers ? 0.3 : 1}
                  style={{
                    transition: "opacity 150ms ease-out, filter 0.25s ease",
                    cursor: "pointer",
                    outline: "none",
                    filter:
                      activeGlow && activeIdx === i
                        ? `drop-shadow(0 0 14px ${s.color}aa)`
                        : "none",
                  }}
                />
              );
            })}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {center != null && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {center}
        </div>
      )}
    </div>
  );
}
