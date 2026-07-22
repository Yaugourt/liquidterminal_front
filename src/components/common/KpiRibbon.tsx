"use client";

/**
 * This file IS the canonical KPI ribbon primitive (DESIGN_SYSTEM §7.b) — the
 * single allowed place to hand-write the `gap-px bg-border-subtle` strip. Every
 * page must consume <KpiRibbon>. When the ESLint guardrail banning hand-rolled
 * ribbons outside common/ lands, this file gets the sanctioned disable.
 */
import type { ReactNode } from "react";
import { useLiquidSurface } from "./LiquidSurface";

/** Value color, mapped to a semantic token — never a raw hex. */
export type KpiTone = "default" | "gold" | "success" | "danger";

const TONE_CLASS: Record<KpiTone, string> = {
  default: "text-text-primary",
  gold: "text-gold",
  success: "text-success",
  danger: "text-danger",
};

/**
 * Default responsive column classes by cell count. Literal strings so the
 * Tailwind JIT keeps them. Override with the `columns` prop when a ribbon
 * needs a bespoke breakpoint rhythm (e.g. a 2-up bridge sub-ribbon).
 */
const DEFAULT_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6",
  7: "grid-cols-2 sm:grid-cols-4 xl:grid-cols-7",
  8: "grid-cols-2 sm:grid-cols-4 xl:grid-cols-8",
};

export interface KpiCell {
  /** Uppercase caption above the value. */
  label: ReactNode;
  /** The metric. Pre-formatted (compactUsd/…); rendered in `.mono`. */
  value: ReactNode;
  /** Optional caption under the value (e.g. "12 validators", a delta %). */
  sub?: ReactNode;
  /** Value color via a semantic token. */
  tone?: KpiTone;
  /** Optional sparkline pinned to the bottom of the cell — only when the API
   *  exposes a real series for this metric (§7.b). */
  sparkline?: ReactNode;
  /** Stable key; falls back to index. */
  key?: string;
}

export interface KpiRibbonHeaderProps {
  label: ReactNode;
  helper?: ReactNode;
}

export interface KpiRibbonProps {
  cells: KpiCell[];
  /** Override the responsive column classes (defaults by cell count). */
  columns?: string;
  /** Optional sub-ribbon header strip (used when grouping ribbons). */
  header?: KpiRibbonHeaderProps;
  /** Wrap in the bordered/rounded container. Default true. Set false to embed
   *  the bare cell strip inside an outer container. */
  bordered?: boolean;
  /** Visual treatment. "boxed" (default): gap-px surface strip, 20px/600 value.
   *  "plain" (minimal DS): hairline dividers, no fill, 22px/medium value, 10px label. */
  variant?: "boxed" | "plain";
  className?: string;
}

function RibbonHeader({ label, helper }: KpiRibbonHeaderProps) {
  return (
    <div className="flex items-baseline gap-2 px-3.5 py-2 bg-surface-2 border-b border-border-subtle">
      <span className="text-[9.5px] uppercase tracking-[0.1em] text-text-secondary font-semibold">
        {label}
      </span>
      {helper && <span className="text-[10px] text-text-tertiary">{helper}</span>}
    </div>
  );
}

/**
 * KpiRibbon — the single source of composition for the V4 KPI ribbon (§7.b).
 *
 * Horizontal strip of stat cells separated by hair-line dividers. Locked on
 * the V4 look (surface, border, radius, label/value type, mono numbers);
 * flexible on cell count, content (ReactNode value/sub), tone and an optional
 * sparkline. Group several ribbons by stacking <KpiRibbon header=…> in a
 * `space-y-*` wrapper.
 */
export function KpiRibbon({
  cells,
  columns,
  header,
  bordered = true,
  variant = "boxed",
  className,
}: KpiRibbonProps) {
  const cols = columns ?? DEFAULT_COLUMNS[cells.length] ?? "grid-cols-2 sm:grid-cols-3";
  const plain = variant === "plain";

  /*
   * The liquid layer is allowed to pass BEHIND a ribbon (the landing hero does
   * exactly that) only because `boxed` cells paint an opaque `bg-surface`. With
   * `plain`, or unbordered, the currents come through and land under the
   * numbers, which §13 forbids. That safety was an accident of a default until
   * now; here it is a decision. Dev-only: shipping a hard throw to users over a
   * decorative rule would be worse than the rule it protects.
   */
  const inLiquid = useLiquidSurface();
  if (process.env.NODE_ENV !== "production" && inLiquid && (plain || !bordered)) {
    throw new Error(
      '<KpiRibbon> inside a <LiquidSurface> must stay opaque: use variant="boxed" ' +
        "with `bordered` (DESIGN_SYSTEM §13). A transparent ribbon lets the flow " +
        "field render behind the numbers."
    );
  }

  const gridClass = plain
    ? `grid ${cols} divide-x divide-y sm:divide-y-0 divide-border-subtle`
    : `grid ${cols} gap-px bg-border-subtle`;
  // min-w-0 : sans lui, le label `truncate` (nowrap) impose sa largeur
  // min-content à la colonne et le ribbon déborde au lieu de tronquer.
  const cellClass = plain
    ? "px-5 py-4 flex flex-col min-w-0"
    : "bg-surface hover:bg-surface-2 transition-colors px-4 py-3 flex flex-col min-w-0";
  const labelClass = plain
    ? "text-[10px] uppercase tracking-[0.08em] text-text-tertiary truncate"
    : "text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold truncate";
  const valueBase = plain
    ? "mono text-[22px] font-medium tracking-[-0.01em] leading-none mt-2"
    : "mono text-[20px] font-semibold tracking-[-0.02em] leading-none mt-1.5";
  const subClass = plain
    ? "text-[10.5px] text-text-tertiary mt-1.5"
    : "mono text-[10px] text-text-tertiary mt-1.5";
  const outerBorder = plain ? "border-border-subtle" : "border-border-default";

  const grid = (
    <div className={gridClass}>
      {cells.map((cell, i) => (
        <div key={cell.key ?? i} className={cellClass}>
          <div className={labelClass}>{cell.label}</div>
          <div className={`${valueBase} ${TONE_CLASS[cell.tone ?? "default"]}`}>
            {cell.value}
          </div>
          {cell.sub != null && <div className={subClass}>{cell.sub}</div>}
          {cell.sparkline != null && <div className="mt-auto pt-2">{cell.sparkline}</div>}
        </div>
      ))}
    </div>
  );

  if (!bordered && !header) {
    return className ? <div className={className}>{grid}</div> : grid;
  }

  return (
    <div
      className={`border ${outerBorder} rounded-lg overflow-hidden${
        className ? ` ${className}` : ""
      }`}
    >
      {header && <RibbonHeader {...header} />}
      {grid}
    </div>
  );
}
