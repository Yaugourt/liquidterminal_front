import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Fill colours available to a bar segment (tokens only). */
export type CellBarTone = "brand" | "success" | "danger" | "gold" | "muted";

const FILL: Record<CellBarTone, string> = {
  brand: "bg-brand/70",
  success: "bg-success",
  danger: "bg-danger",
  gold: "bg-gold",
  muted: "bg-text-tertiary/60",
};

interface CellBarSegment {
  /** Share of the track, 0–1. Segments are drawn left to right. */
  value: number;
  tone: CellBarTone;
}

interface CellBarProps {
  /** Single fill, 0–1 (progress, share of total). Ignored when `segments` is set. */
  value?: number;
  /** Fill colour of the single bar. Default brand. */
  tone?: CellBarTone;
  /** Several adjacent fills (e.g. long vs short split). */
  segments?: CellBarSegment[];
  /** Figure after the bar: a string/number ("42%", aligned mono) or a `<CellValue>`. */
  label?: ReactNode;
  /** Track width in px. Default 64. Use `"full"` to fill the cell. */
  width?: number | "full";
  /** Hover title (exact figure). */
  title?: string;
  /** Column alignment — match the column's `align`. Default right. */
  align?: "left" | "right";
}

const clamp = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));

/**
 * CellBar — the one progress / share bar for table cells: 6px rounded track
 * on `bg-surface-2`, token fills, optional mono label. Covers progress (TWAP
 * fill), share-of-total and two-sided splits (long/short) — never hand-roll a
 * `style={{ width }}` bar in a column.
 */
export function CellBar({ value = 0, tone = "brand", segments, label, width = 64, title, align = "right" }: CellBarProps) {
  const parts = segments ?? [{ value, tone }];
  return (
    <div
      className={cn("flex items-center gap-2", align === "right" ? "justify-end" : "justify-start", width === "full" && "w-full")}
      title={title}
    >
      <div
        className={cn("flex h-1.5 overflow-hidden rounded-full bg-surface-2", width === "full" && "flex-1")}
        style={width === "full" ? undefined : { width }}
      >
        {parts.map((p, i) => (
          <span key={i} className={cn("h-full", FILL[p.tone])} style={{ width: `${clamp(p.value) * 100}%` }} />
        ))}
      </div>
      {typeof label === "string" || typeof label === "number" ? (
        // Fixed min width so bars line up down the column whatever the figure.
        <span className="mono min-w-[44px] whitespace-nowrap text-right text-[11px] text-text-secondary">{label}</span>
      ) : (
        label
      )}
    </div>
  );
}
