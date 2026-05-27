"use client";

import { chartPalette } from "@/components/common";
import type { Hip4QuestionOutcome } from "@/services/indexer/hip4";

interface Hip4OutcomeBarProps {
  outcome: Hip4QuestionOutcome;
  /** 0–9; for distinct colors when a question has multiple named outcomes. */
  colorIndex?: number;
}

/**
 * Multi-outcome bar — colored via `chartPalette.multiSeries` to stay consistent
 * with the dashboard's category palette. For Yes/No binary markets prefer
 * `<ProbRow>` inside Hip4QuestionCard (success/danger tokens).
 */
const PALETTE = chartPalette.multiSeries;

function priceToCents(px: number | null): string {
  if (px == null || !Number.isFinite(px)) return "—";
  const pct = Math.max(0, Math.min(1, px)) * 100;
  return `${pct.toFixed(0)}¢`;
}

export function Hip4OutcomeBar({ outcome, colorIndex = 0 }: Hip4OutcomeBarProps) {
  const color = PALETTE[colorIndex % PALETTE.length] ?? chartPalette.accent;
  const ratio = outcome.mid_price != null && Number.isFinite(outcome.mid_price)
    ? Math.max(0, Math.min(1, outcome.mid_price))
    : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 min-w-0 truncate text-[12px] font-semibold text-text-primary">
        {outcome.display_name || `#${outcome.outcome_id}`}
      </span>
      <div className="relative h-1 w-24 sm:w-32 rounded-full bg-surface-2 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${ratio * 100}%`, background: color }}
        />
      </div>
      <span
        className="mono shrink-0 text-[11px] font-semibold w-10 text-right"
        style={{ color }}
      >
        {priceToCents(outcome.mid_price)}
      </span>
    </div>
  );
}
