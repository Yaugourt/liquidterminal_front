"use client";

/**
 * StackedShareBar — a single horizontal track split into proportional colored
 * segments (e.g. Buy vs Sell share, or N-outcome composition). Distinct from
 * `<FlowBar>` (one fill against a track) and `<Progress>` (single value, fixed
 * brand gradient): this renders the *relative split* of several parts.
 *
 * Colors: prefer `colorClass` (a `bg-*` design token) so the bar stays on-token;
 * `color` (explicit, e.g. a `chartPalette` entry) is available for multi-series.
 */

export interface ShareSegment {
  value: number;
  /** Tailwind `bg-*` token class (preferred). */
  colorClass?: string;
  /** Explicit color — overrides `colorClass` (use a `chartPalette` value). */
  color?: string;
  /** Tooltip / aria label. */
  label?: string;
  key?: string;
}

export interface StackedShareBarProps {
  segments: ShareSegment[];
  /** Track height in px (default 8). */
  height?: number;
  /** Minimum visible width (%) for a non-zero segment (default 2). */
  minPct?: number;
  rounded?: boolean;
  className?: string;
}

export function StackedShareBar({
  segments,
  height = 8,
  minPct = 2,
  rounded = true,
  className,
}: StackedShareBarProps) {
  const total = segments.reduce((acc, s) => acc + Math.max(0, s.value), 0);

  return (
    <div
      className={`flex w-full overflow-hidden bg-surface-2 ${rounded ? "rounded-full" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={{ height }}
    >
      {total > 0 &&
        segments.map((s, i) => {
          const v = Math.max(0, s.value);
          if (v === 0) return null;
          const pct = Math.max((v / total) * 100, minPct);
          return (
            <div
              key={s.key ?? i}
              title={s.label}
              className={`h-full transition-[width] duration-500 ease-out ${
                s.color ? "" : s.colorClass ?? "bg-brand"
              }`}
              style={{ width: `${pct}%`, ...(s.color ? { background: s.color } : {}) }}
              aria-label={s.label}
            />
          );
        })}
    </div>
  );
}
