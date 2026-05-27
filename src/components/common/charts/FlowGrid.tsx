"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { chartPalette } from "./chartTheme";

/**
 * FlowGrid — shared "Top N ranking with animated bars" primitive.
 *
 * Consolidates the visual contract used by `BuildersFlowChart` and
 * `Hip4MarketsFlowChart`. The Builders flow is the visual reference:
 *  - Container `motion.div`: opacity 0→1, y 8→0, delay 0.15s, duration 0.35s
 *  - Each row: opacity 0→1, x -4→0, delay i·0.03, duration 0.25s (stagger)
 *  - Each row hover toggles `bg-surface-2 -mx-1 px-1 rounded`
 *  - Each bar (via `<FlowBar>`): width 0→ratio·100%, duration 0.6s, easeOut,
 *    delay i·0.03 — synced with its row.
 *
 * Consumers own the column definitions: header label, width, align, and a
 * render function that produces the cell content. The bar(s) inside the row
 * are rendered via `<FlowBar>` to keep the animation contract identical.
 */

type FlowGridAlign = "left" | "right" | "center";

export interface FlowGridColumn<T> {
  header: ReactNode;
  /** Column width — number (px) or string CSS unit (`"1fr"`, `"auto"`, `"30%"`). */
  width: number | string;
  align?: FlowGridAlign;
  /** Renders the cell for a given row. `isHovered` is true when the row is hovered. */
  render: (row: T, index: number, isHovered: boolean) => ReactNode;
}

export interface FlowGridProps<T> {
  rows: T[];
  /** Stable React key for a row (e.g. `(r) => r.builder`). */
  rowKey: (row: T, index: number) => string;
  columns: FlowGridColumn<T>[];
  /** Container entrance delay in seconds (default `0.15`). */
  containerDelay?: number;
  /** Per-row stagger delay in seconds (default `0.03`). */
  rowStagger?: number;
  /** Vertical gap between rows in px (default `6`, i.e. `gap-1.5`). */
  rowGap?: number;
  /** Optional column-headers row (uppercase tertiary). Pass `false` to hide. */
  showHeaders?: boolean;
  /** Hover state change callback — useful to render a hover-aware footer. */
  onHoverChange?: (index: number | null) => void;
}

function flowAlignClass(align: FlowGridAlign | undefined): string {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

function widthValue(width: number | string): string {
  return typeof width === "number" ? `${width}px` : width;
}

export function FlowGrid<T>({
  rows,
  rowKey,
  columns,
  containerDelay = 0.15,
  rowStagger = 0.03,
  rowGap = 6,
  showHeaders = true,
  onHoverChange,
}: FlowGridProps<T>) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const setHover = (idx: number | null) => {
    setHoverIdx(idx);
    onHoverChange?.(idx);
  };

  const gridTemplate = columns.map((c) => widthValue(c.width)).join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: containerDelay, duration: 0.35 }}
      className="flex flex-col"
      style={{ gap: rowGap }}
    >
      {showHeaders && (
        <div
          className="grid gap-2.5 items-center text-[10px] font-medium uppercase tracking-wider text-text-tertiary"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {columns.map((c, i) => (
            <span
              key={i}
              className={flowAlignClass(c.align)}
            >
              {c.header}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5" onMouseLeave={() => setHover(null)}>
        {rows.map((row, i) => {
          const isHovered = hoverIdx === i;
          return (
            <motion.div
              key={rowKey(row, i)}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * rowStagger, duration: 0.25 }}
              onMouseEnter={() => setHover(i)}
              className={`grid gap-2.5 items-center text-[11px] cursor-default transition-colors ${
                isHovered ? "bg-surface-2 -mx-1 px-1 rounded" : ""
              }`}
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {columns.map((c, ci) => (
                <span
                  key={ci}
                  className={`min-w-0 ${flowAlignClass(c.align)}`}
                >
                  {c.render(row, i, isHovered)}
                </span>
              ))}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ============================================================
 * FlowBar — animated horizontal bar synchronised with a FlowGrid row.
 *
 * Variants:
 *   - "solid" (Builders ref): solid brand fill, with optional label inside.
 *   - "gradient" (Hip4 ref): linear gradient fading by ratio (denser at the
 *     thick end, lighter at the thin end). Color comes from `color` prop.
 *
 * Direction:
 *   - "ltr" (default): bar grows from left to right.
 *   - "rtl": bar grows from right to left (used for the volume column in
 *     Hip4MarketsFlowChart where it mirrors the OI bar in the next column).
 *
 * The animation matches the FlowGrid row stagger: pass `delay={i * rowStagger}`
 * to keep bars in sync with their parent rows.
 * ========================================================== */

export interface FlowBarProps {
  /** 0..1 ratio of the bar length to its container width. */
  ratio: number;
  /** Stagger delay in seconds, typically `index * rowStagger`. */
  delay?: number;
  variant?: "solid" | "gradient";
  /** Solid color or gradient base. Defaults to `chartPalette.accent` (brand cyan). */
  color?: string;
  direction?: "ltr" | "rtl";
  /** Bar height in px (default `18`). */
  height?: number;
  /** Minimum visible width in % (default `0`). Use 6 for "always visible even when ratio = 0". */
  minVisiblePct?: number;
  /** Optional label rendered inside the bar (typically the formatted value). */
  label?: ReactNode;
  /** Whether the label should sit at the thick end of the bar (default `true`). */
  labelInside?: boolean;
}

export function FlowBar({
  ratio,
  delay = 0,
  variant = "solid",
  color = chartPalette.accent,
  direction = "ltr",
  height = 18,
  minVisiblePct = 0,
  label,
  labelInside = true,
}: FlowBarProps) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const targetPct = Math.max(clamped * 100, minVisiblePct);

  if (variant === "gradient") {
    const startAlpha = (0.15 + clamped * 0.5).toFixed(3);
    const endAlpha = (0.35 + clamped * 0.55).toFixed(3);
    const rgb = hexToRgbTriplet(color);
    const gradient =
      direction === "ltr"
        ? `linear-gradient(90deg, rgba(${rgb}, ${startAlpha}), rgba(${rgb}, ${endAlpha}))`
        : `linear-gradient(90deg, rgba(${rgb}, ${endAlpha}), rgba(${rgb}, ${startAlpha}))`;

    return (
      <div
        className={`relative flex min-w-0 items-center ${
          direction === "rtl" ? "justify-end pr-2" : "justify-start pl-2"
        }`}
        style={{ height }}
      >
        {label && labelInside && (
          <span
            className={`pointer-events-none absolute ${
              direction === "rtl" ? "right-2" : "left-1.5"
            } top-1/2 z-10 -translate-y-1/2 text-[10px] font-semibold tabular-nums text-text-primary whitespace-nowrap`}
            style={{
              textShadow: "0 0 1px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.9)",
            }}
          >
            {label}
          </span>
        )}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: clamped }}
          transition={{ duration: 0.6, ease: "easeOut", delay }}
          style={{
            transformOrigin: direction === "rtl" ? "right center" : "left center",
            background: gradient,
          }}
          className={`h-full w-full ${direction === "rtl" ? "rounded-l-md" : "rounded-r-md"}`}
          aria-hidden
        />
      </div>
    );
  }

  // Solid variant — Builders reference.
  return (
    <div
      className="relative overflow-hidden rounded-[3px] bg-surface-2"
      style={{ height }}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${targetPct}%` }}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
        className="h-full rounded-[3px] flex items-center px-1.5"
        style={{ background: color }}
      >
        {label && labelInside && (
          <span className="mono text-[10px] font-medium text-brand-text-on whitespace-nowrap">
            {label}
          </span>
        )}
      </motion.div>
    </div>
  );
}

/** Convert a `#RRGGBB` hex to the `"R, G, B"` triplet string used in
 *  `rgba(R, G, B, alpha)`. Accepts a few common Tailwind-ish hex inputs.
 *  Falls back to `chartPalette.accent` triplet on parse error. */
function hexToRgbTriplet(input: string): string {
  if (input.startsWith("rgb")) {
    const m = input.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const parts = m[1].split(/[,\s/]+/).filter(Boolean).slice(0, 3);
      if (parts.length === 3) return parts.join(", ");
    }
  }
  let hex = input.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (hex.length !== 6) return "131, 233, 255";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return "131, 233, 255";
  return `${r}, ${g}, ${b}`;
}
