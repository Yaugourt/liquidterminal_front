import type { ReactNode } from "react";

/**
 * One segment of a DominanceBar.
 *
 * Provide EITHER `color` (an inline CSS color, typically from `chartPalette`)
 * OR `fillClassName` (a token-based background, e.g. "bg-surface-2") so the
 * component never hardcodes a hex value.
 */
export interface DominanceSegment {
  key: string;
  label: string;
  /** Percentage of the whole, 0..100. */
  pct: number;
  /** Inline fill color (from chartPalette). Takes precedence over fillClassName. */
  color?: string;
  /** Token-based fill class (e.g. "bg-surface-2") for neutral segments. */
  fillClassName?: string;
  /** Text token for the in-bar label/legend swatch contrast. */
  labelClassName?: string;
}

export interface DominanceBarProps {
  segments: DominanceSegment[];
  /** Bar height in px (default 36). */
  height?: number;
  /** Right-aligned caption above the bar (e.g. the headline share). */
  caption?: ReactNode;
  /** Left-aligned title above the bar. */
  title?: ReactNode;
  /** Render a wrapping legend below the bar (default true). */
  legend?: boolean;
  /** Minimum segment width (%) below which the in-bar label is hidden. */
  labelThresholdPct?: number;
  className?: string;
}

/**
 * A single 100%-width stacked dominance bar — one dominant segment versus a
 * ranked set of smaller ones, used to show concentration at a glance (e.g. how
 * staked HYPE splits across validators). Each segment fills proportionally to
 * `pct`; wide-enough segments render their label inline, the rest fall back to
 * the legend. Colors come from the caller (chartPalette / tokens) so no hex
 * lives here.
 */
export function DominanceBar({
  segments,
  height = 36,
  caption,
  title,
  legend = true,
  labelThresholdPct = 10,
  className,
}: DominanceBarProps) {
  return (
    <div className={className}>
      {(title || caption) && (
        <div className="flex items-baseline justify-between mb-2">
          {title ? (
            <span className="text-[12px] text-text-secondary">{title}</span>
          ) : (
            <span />
          )}
          {caption && (
            <span className="mono text-[11px] text-text-tertiary">{caption}</span>
          )}
        </div>
      )}

      <div
        className="flex w-full rounded-lg overflow-hidden border border-border-subtle bg-base"
        style={{ height }}
      >
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={`h-full flex items-center justify-center border-r border-base last:border-r-0 ${seg.fillClassName ?? ""}`}
            style={{
              width: `${seg.pct}%`,
              ...(seg.color ? { background: seg.color } : {}),
            }}
            title={`${seg.label} · ${seg.pct.toFixed(1)}%`}
          >
            {seg.pct >= labelThresholdPct && (
              <span
                className={`mono text-[11px] font-medium px-2 truncate ${seg.labelClassName ?? "text-text-secondary"}`}
              >
                {seg.label} · {seg.pct.toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>

      {legend && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-text-secondary mt-3">
          {segments.map((seg) => (
            <span key={seg.key} className="inline-flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-sm shrink-0 ${seg.fillClassName ?? ""} ${seg.fillClassName ? "border border-border-default" : ""}`}
                style={seg.color ? { background: seg.color } : undefined}
              />
              {seg.label}
              <span className="mono text-text-tertiary">{seg.pct.toFixed(1)}%</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
