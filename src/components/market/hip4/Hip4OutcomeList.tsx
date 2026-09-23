"use client";

import { Card } from "@/components/ui/card";
import { CardHead, OutcomeRow, chartPalette } from "@/components/common";
import { isResidualOutcome } from "@/lib/hip4/market-formatter";
import type { Hip4DetailLayout } from "@/lib/hip4/detail-layout";
import type {
  Hip4QuestionOutcome,
  Hip4QuestionWithOutcomesRow,
} from "@/services/indexer/hip4";

interface Hip4OutcomeListProps {
  question: Hip4QuestionWithOutcomesRow | null;
  layout: Hip4DetailLayout;
  /** Currently-selected outcome coin (drives book + fills scope). */
  activeCoin: string;
  onSelectCoin: (coin: string) => void;
}

function outcomeCoin(o: Hip4QuestionOutcome): string {
  return o.coin ?? `#${o.outcome_id}`;
}

function pctOf(o: Hip4QuestionOutcome): number | null {
  return o.mid_price != null && Number.isFinite(o.mid_price) ? o.mid_price * 100 : null;
}

/**
 * The outcomes panel — one selectable `OutcomeRow` per outcome. Renders the
 * three layout variants (see `resolveHip4Layout`):
 *   • binary  → Yes/No, success/danger polarity
 *   • versus  → two non-Yes/No sides (teams, change/no-change), multi-series colors
 *   • ladder  → N buckets/candidates, multi-series colors
 * Selecting a row points the order book + recent fills at that outcome's coin.
 * Colors mirror `Hip4ProbabilityChart` so the list and the odds curve agree.
 */
export function Hip4OutcomeList({
  question,
  layout,
  activeCoin,
  onSelectCoin,
}: Hip4OutcomeListProps) {
  const outcomes = (question?.outcomes ?? []).filter(
    (o) => !isResidualOutcome(o.display_name)
  );
  if (outcomes.length === 0) return null;

  const header = layout.outcomesVariant === "ladder" ? "Outcomes" : "Sides";

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHead
        title={header}
        tag={`${outcomes.length} ${outcomes.length === 1 ? "outcome" : "outcomes"}`}
      />

      <div className="flex flex-col gap-2 p-3">
        {outcomes.map((o, i) => {
          const coin = outcomeCoin(o);
          const variant =
            layout.isYesNo && i === 0
              ? "success"
              : layout.isYesNo && i === 1
              ? "danger"
              : "brand";
          // Yes/No keeps semantic tokens; everything else uses the same palette
          // as the probability chart's per-outcome lines.
          const color = layout.isYesNo
            ? undefined
            : chartPalette.multiSeries[i % chartPalette.multiSeries.length];
          return (
            <OutcomeRow
              // Both sides of an ungrouped HypeDexer binary share one outcome_id.
              key={`${o.outcome_id}-${i}`}
              label={o.display_name || `Outcome ${i + 1}`}
              pct={pctOf(o)}
              variant={variant}
              color={color}
              volume={o.total_volume}
              selected={coin === activeCoin}
              onSelect={/^#\d+$/.test(coin) ? () => onSelectCoin(coin) : undefined}
            />
          );
        })}
      </div>
    </Card>
  );
}
