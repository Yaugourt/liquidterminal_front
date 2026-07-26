"use client";

import { memo } from "react";

/**
 * The key for a multi-series chart.
 *
 * Every chart on these chapters stacks or overlays at least two series, and
 * without this the only way to learn which band is which is to hover — which
 * rules out anyone reading a screenshot, and these pages are read as
 * screenshots more often than they are visited.
 *
 * `shape` carries the distinction beyond colour: a bar and a line in the same
 * card are two different marks, and a legend that draws both as identical
 * swatches loses that. It also gives a second channel to readers who cannot
 * separate the hues.
 */

export type LegendShape = "area" | "bar" | "line";

export interface LegendItem {
  key: string;
  label: string;
  color: string;
  shape?: LegendShape;
  /** Optional trailing figure, e.g. a share of the window. */
  value?: string;
}

function Mark({ color, shape = "area" }: { color: string; shape?: LegendShape }) {
  if (shape === "line") {
    return (
      <span
        aria-hidden
        className="inline-block w-3 h-[2px] rounded-full"
        style={{ background: color }}
      />
    );
  }
  if (shape === "bar") {
    return (
      <span
        aria-hidden
        className="inline-block w-2 h-3 rounded-[1px]"
        style={{ background: color }}
      />
    );
  }
  return (
    <span aria-hidden className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
  );
}

export const SeriesLegend = memo(function SeriesLegend({ items }: { items: LegendItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 border-t border-border-subtle">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5 text-[10.5px] text-text-secondary">
          <Mark color={item.color} shape={item.shape} />
          {item.label}
          {item.value && <span className="text-text-tertiary mono">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
});
