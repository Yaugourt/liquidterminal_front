"use client";

import type { ReactNode } from "react";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/**
 * OutcomeRow — the canonical "labelled probability bar" row (DESIGN_SYSTEM §7.c).
 *
 * One outcome of a prediction market: a colored dot + label, an optional volume
 * + the implied probability on the right, and a thin progress bar underneath.
 * Consolidates the two hand-rolled variants that predated it — the Yes/No
 * `ProbRow` inside `Hip4QuestionCard` (token-based success/danger/brand) and the
 * multi-outcome `Hip4OutcomeBar` (explicit `chartPalette.multiSeries` color).
 *
 * Color: pass EITHER `variant` (semantic token, for Yes/No/brand) OR `color`
 * (explicit hex from `chartPalette`, for multi-series). `color` wins.
 *
 * Selection: pass `onSelect` to make the row an interactive button (used by the
 * detail-page outcomes ladder/versus list); `selected` draws the active ring.
 */

export type OutcomeRowVariant = "success" | "danger" | "brand";

export interface OutcomeRowProps {
  label: ReactNode;
  /** Implied probability, 0–100. `null` renders an em dash (no liquidity yet). */
  pct: number | null;
  /** Semantic color. Ignored when `color` is set. */
  variant?: OutcomeRowVariant;
  /** Explicit color (e.g. `chartPalette.multiSeries[i]`). Overrides `variant`. */
  color?: string;
  /** Cumulative volume for this outcome; hidden when null/0. */
  volume?: number | null;
  /** Makes the row a selectable button. */
  onSelect?: () => void;
  /** Active state when selectable. */
  selected?: boolean;
  /** Optional right-aligned node after the percentage (e.g. a chip). */
  trailing?: ReactNode;
  className?: string;
}

const VARIANT_BAR: Record<OutcomeRowVariant, string> = {
  success: "bg-success",
  danger: "bg-danger",
  brand: "bg-brand",
};
const VARIANT_TEXT: Record<OutcomeRowVariant, string> = {
  success: "text-success",
  danger: "text-danger",
  brand: "text-brand",
};

export function OutcomeRow({
  label,
  pct,
  variant = "brand",
  color,
  volume,
  onSelect,
  selected = false,
  trailing,
  className,
}: OutcomeRowProps) {
  const hasPrice = pct != null && Number.isFinite(pct);
  const safePct = hasPrice ? Math.max(0, Math.min(100, pct as number)) : 0;

  const useColor = !!color;
  const dotStyle = useColor ? { background: color } : undefined;
  const dotClass = useColor ? "" : VARIANT_BAR[variant];
  const barStyle = useColor ? { background: color } : undefined;
  const barClass = useColor ? "" : VARIANT_BAR[variant];
  const pctStyle = useColor && hasPrice ? { color } : undefined;
  const pctClass = useColor
    ? hasPrice
      ? ""
      : "text-text-tertiary"
    : hasPrice
    ? VARIANT_TEXT[variant]
    : "text-text-tertiary";

  const body = (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} style={dotStyle} />
          <span className="truncate text-[12px] font-semibold text-text-primary">{label}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {volume != null && volume > 0 && (
            <span className="mono text-[10px] text-text-tertiary">{compactUsd(volume)}</span>
          )}
          <span className={`mono text-[12.5px] font-semibold ${pctClass}`} style={pctStyle}>
            {hasPrice ? `${safePct.toFixed(1)}%` : "—"}
          </span>
          {trailing}
        </div>
      </div>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className={`absolute inset-y-0 left-0 rounded-full opacity-70 transition-[width] duration-500 ease-out ${barClass}`}
          style={{ width: `${safePct}%`, ...barStyle }}
        />
      </div>
    </div>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
          selected
            ? "border-brand/40 bg-brand/5"
            : "border-border-subtle bg-surface hover:border-border-default hover:bg-surface-2"
        }${className ? ` ${className}` : ""}`}
      >
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}
