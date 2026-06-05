"use client";

import { ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OutcomeRow, chartPalette } from "@/components/common";
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
      <div className="flex items-center gap-2.5 border-b border-border-subtle px-3.5 py-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/10">
          <ListChecks size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">{header}</h3>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {outcomes.length} {outcomes.length === 1 ? "outcome" : "outcomes"}
        </span>
      </div>

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
              key={o.outcome_id}
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
