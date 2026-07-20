"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

/**
 * Shared shell for the three HIP-3 fact cards.
 *
 * They sit side by side and previously each invented its own layout — one led
 * with a number and a gauge, one was a four-row spec sheet, one a number and a
 * bar — so they read as three unrelated widgets, and the shortest left a hole
 * at the bottom once the grid stretched them to equal height.
 *
 * Every slot here is positional, so the three cannot drift apart again:
 * head, hero value, a fixed-height visual band, a pair of end labels, and one
 * line of context pinned to the bottom.
 */
export function Hip3FactCard({
  title,
  headAside,
  value,
  unit,
  qualifier,
  visual,
  leftLabel,
  rightLabel,
  context,
}: {
  title: string;
  /** Right side of the card head — a chip or a link. */
  headAside?: ReactNode;
  /** The one headline value. */
  value: ReactNode;
  /** Small suffix rendered inside the value, e.g. "bps". */
  unit?: string;
  /** Short phrase to the right of the value. */
  qualifier?: ReactNode;
  /** Gauge, bar or chip row. Occupies the same vertical band on all three. */
  visual?: ReactNode;
  leftLabel?: ReactNode;
  rightLabel?: ReactNode;
  /** One line, always last. */
  context: ReactNode;
}) {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-baseline gap-2 px-4 py-2.5 border-b border-border-subtle">
        <h3 className="text-[13px] font-medium text-text-primary truncate">{title}</h3>
        {headAside ? <div className="ml-auto shrink-0">{headAside}</div> : null}
      </div>

      <div className="px-4 pt-3.5 pb-3 flex flex-col gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="mono text-[26px] font-medium tracking-[-0.02em] leading-none text-text-primary">
            {value}
            {unit ? <span className="text-[14px] text-text-tertiary"> {unit}</span> : null}
          </span>
          {qualifier ? (
            <span className="text-[11px] text-text-tertiary truncate">{qualifier}</span>
          ) : null}
        </div>

        {/* Fixed band so a card with no visual keeps the others' rhythm. */}
        <div className="min-h-[26px] flex flex-col justify-center">{visual}</div>

        {(leftLabel || rightLabel) && (
          <div className="flex items-center justify-between gap-3 text-[11px] text-text-tertiary">
            <span className="truncate">{leftLabel}</span>
            <span className="truncate text-right">{rightLabel}</span>
          </div>
        )}
      </div>

      <div className="mt-auto px-4 py-2 border-t border-border-subtle text-[11px] text-text-tertiary">
        {context}
      </div>
    </Card>
  );
}

/** Chip used in the card heads and in the control card's power row. */
export function Hip3Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "muted";
}) {
  const cls =
    tone === "success"
      ? "bg-success/10 border-success/25 text-success"
      : tone === "muted"
        ? "bg-surface-2 border-border-subtle text-text-tertiary"
        : "bg-surface-2 border-border-subtle text-text-secondary";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] px-1.5 py-0.5 rounded border font-medium ${cls}`}
    >
      {children}
    </span>
  );
}
