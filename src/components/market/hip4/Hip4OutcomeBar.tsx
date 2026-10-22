"use client";

import { chartPalette } from "@/components/common";
import { outcomePrice } from "@/lib/hip4/market-formatter";
import type { Hip4QuestionOutcome, Hip4WonBy } from "@/services/indexer/hip4";
import { Hip4WonMark } from "./Hip4WonMark";

interface Hip4OutcomeBarProps {
  outcome: Hip4QuestionOutcome;
  /** 0–9; for distinct colors when a question has multiple named outcomes. */
  colorIndex?: number;
  /** How the question's winner is known, once it no longer trades. */
  wonBy?: Hip4WonBy | null;
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

export function Hip4OutcomeBar({ outcome, colorIndex = 0, wonBy }: Hip4OutcomeBarProps) {
  const color = PALETTE[colorIndex % PALETTE.length] ?? chartPalette.accent;
  const price = outcomePrice(outcome);
  const ratio = price != null ? Math.max(0, Math.min(1, price)) : 0;

  return (
    <div className={`flex items-center gap-3${outcome.won === false ? " opacity-50" : ""}`}>
      <span className="flex flex-1 min-w-0 items-center gap-1.5">
        <span className="min-w-0 truncate text-[12px] font-semibold text-text-primary" title={outcome.display_name || `#${outcome.outcome_id}`}>
          {outcome.display_name || `#${outcome.outcome_id}`}
        </span>
        {outcome.won && <Hip4WonMark wonBy={wonBy} />}
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
        {priceToCents(price)}
      </span>
    </div>
  );
}
