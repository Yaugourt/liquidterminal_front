"use client";

import { Children, ReactNode } from "react";
import { Card } from "@/components/ui/card";

/**
 * The HIP-3 facts, as one block of aligned rows.
 *
 * These three facts used to be three side-by-side cards in a `grid-cols-3`,
 * each with its own head, border and footer sentence. Two things were wrong
 * with that. Cards return `null` when their fact has no data — and a fixed grid
 * still reserves the track, so the majority of markets (no listed counterpart
 * for the basis, no published cap) rendered a card-sized hole. And three heads,
 * three borders and three footers spent most of a 197px strip on chrome for
 * three numbers.
 *
 * Rows solve both. A missing fact deletes its row and the block gets shorter;
 * there is no slot left to sit empty. One head serves all three.
 *
 * Sizing note: the values are 14px, deliberately below the KpiRibbon's 22px and
 * the mark price's 24px. In the card version they were 26px — the largest type
 * on the page — which put optional, caveat-laden facts above the price of the
 * thing being traded.
 */
export function Hip3FactList({ children }: { children: ReactNode }) {
  // Children that rendered nothing are dropped by `toArray`, so an all-absent
  // block disappears entirely rather than leaving a head over empty space.
  const rows = Children.toArray(children);
  if (rows.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border-subtle">
        <h3 className="text-[13px] leading-[18px] font-medium text-text-primary">
          What to check on this market
        </h3>
        <span className="inline-flex items-center h-[16px] text-[10px] leading-none font-medium px-1.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          HIP-3
        </span>
      </div>
      <div className="divide-y divide-border-subtle">{rows}</div>
    </Card>
  );
}

/**
 * One fact: subject, value, meter, clause, aside.
 *
 * Flex rather than a grid template on purpose. The widths live once, here, and
 * a row with no meter needs no column-span arithmetic — the clause simply
 * absorbs the space.
 *
 * Three widths, which is why the cells carry `order`. Single line from `xl`.
 * At `lg` the clause drops to its own full-width line: with a 232px sidebar the
 * remaining column is ~120px there, and the caveat broke into three lines. On
 * phones the subject takes a line of its own too.
 */
export function Hip3FactRow({
  subject,
  value,
  unit,
  meter,
  clause,
  aside,
}: {
  subject: string;
  /** The one number. `—` when the fact is known but not answerable. */
  value: ReactNode;
  /** Small suffix inside the value, e.g. "bps" or "%". */
  unit?: string;
  /** Gauge or bar. Omit when the fact is not a measurement — the clause then
   *  takes the column, rather than an empty track being drawn. */
  meter?: ReactNode;
  /** The honest sentence, sitting next to the number it qualifies. */
  clause: ReactNode;
  /** Chip or link, pinned right. */
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 xl:py-2 xl:min-h-[34px]">
      <div className="order-1 w-full lg:w-[168px] lg:shrink-0 text-[12.5px] leading-[18px] font-medium text-text-primary truncate">
        {subject}
      </div>

      <div className="order-2 w-[96px] shrink-0 mono text-[14px] leading-[18px] font-medium text-text-primary whitespace-nowrap">
        {value}
        {unit ? <span className="text-[10.5px] font-normal text-text-tertiary"> {unit}</span> : null}
      </div>

      {/* Absent when the fact is not a measurement — the clause then takes the
          space instead of an empty track being drawn. Dropped on phones, where
          112px of track pushes the aside onto a fourth line and a gauge that
          narrow reads worse than the number already next to it. */}
      {meter ? <div className="order-3 hidden sm:block w-[112px] shrink-0">{meter}</div> : null}

      {/* Wraps rather than truncates: this is the sentence that qualifies the
          number, and an ellipsis lands mid-caveat at intermediate widths. */}
      <div className="order-5 xl:order-4 w-full xl:w-auto xl:flex-1 min-w-0 text-[11.5px] leading-[18px] text-text-tertiary">
        {clause}
      </div>

      {aside ? (
        <div className="order-4 xl:order-5 ml-auto xl:ml-0 shrink-0 flex items-center h-[18px]">
          {aside}
        </div>
      ) : null}
    </div>
  );
}

/** Chip used in the row asides. */
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
      className={`inline-flex items-center h-[18px] gap-1.5 text-[10px] leading-none px-1.5 rounded border font-medium whitespace-nowrap ${cls}`}
    >
      {children}
    </span>
  );
}
