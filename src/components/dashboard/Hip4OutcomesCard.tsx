"use client";

import { memo } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useHip4ActiveMarkets } from "@/services/indexer/hip4";
import type {
  Hip4QuestionOutcome,
  Hip4QuestionWithOutcomesRow,
} from "@/services/indexer/hip4";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { CardHead, SourceBadge, sourceStatus } from "@/components/common";
import { formatExpiryCountdown } from "@/lib/hip4/market-formatter";

/**
 * Hip4OutcomesCard — top open HIP-4 markets by volume.
 *
 * Card-head V4 purple (to distinguish from HIP-3 cyan). Each row:
 * truncated title, Yes/No pair (or top 2 outcomes) with mid_price in cents,
 * cumulative volume, and countdown to expiry.
 */

const TOP_N = 5;

/** Color for an outcome — green/red for binary Yes/No, brand cyan otherwise. */
function outcomeColor(name: string | null, index: number): string {
  if (name === "Yes") return "text-success";
  if (name === "No") return "text-danger";
  return index === 0 ? "text-success" : "text-danger";
}

/** mid_price (0-1) → cents arrondis (ex. 0.682 → "68¢"). */
function priceToCents(mid: number | null | undefined): string {
  if (mid == null || !Number.isFinite(mid)) return "—";
  return `${Math.round(mid * 100)}¢`;
}

function OutcomeRow({ question }: { question: Hip4QuestionWithOutcomesRow }) {
  const title = question.title ?? "Untitled market";
  const countdown = formatExpiryCountdown(question.expiry ?? null);

  // Trie pour avoir Yes / outcome principal en premier dans la liste binaire
  const outcomes: Hip4QuestionOutcome[] = (() => {
    const names = question.outcomes.map((o) => o.display_name);
    if (names.includes("Yes") && names.includes("No")) {
      const yes = question.outcomes.find((o) => o.display_name === "Yes");
      const no = question.outcomes.find((o) => o.display_name === "No");
      return [yes!, no!];
    }
    return question.outcomes.slice(0, 2);
  })();

  return (
    <div className="px-3.5 py-2.5 border-b border-border-subtle last:border-b-0">
      <div className="text-[12px] font-semibold text-text-primary line-clamp-2 mb-1.5">
        {title}
      </div>
      <div className="flex items-center gap-3 text-[11px]">
        {outcomes.map((o, i) => {
          const isYesLike = o.display_name === "Yes" || (o.display_name !== "No" && i === 0);
          return (
            <span key={`${o.outcome_id}-${i}`} className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  isYesLike ? "bg-success" : "bg-danger"
                }`}
              />
              <span
                className={`mono font-semibold ${outcomeColor(o.display_name, i)}`}
              >
                {o.display_name} {priceToCents(o.mid_price)}
              </span>
            </span>
          );
        })}
        <span className="text-text-tertiary mono ml-auto">
          {compactUsd(question.total_volume)} vol
        </span>
        {countdown && (
          <span className="text-text-tertiary mono text-[10px] whitespace-nowrap inline-flex items-center gap-1">
            <Clock size={10} />
            {countdown.replace("Expires in ", "")}
          </span>
        )}
      </div>
    </div>
  );
}

export const Hip4OutcomesCard = memo(function Hip4OutcomesCard() {
  const { questions, totalVolume, activeCount, isLoading, error } =
    useHip4ActiveMarkets(TOP_N);

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="HIP-4 Outcomes"
        tag={
          <>
            {activeCount} live · <span className="mono">{compactUsd(totalVolume)} vol</span>
          </>
        }
        actions={<SourceBadge source="hypedexer" status={sourceStatus(error, isLoading)} />}
        href="/market/hip4"
      />

      <div className="flex-1">
        {isLoading && questions.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
            Loading…
          </div>
        ) : error ? (
          <div className="px-3.5 py-6 text-center text-[11px] text-danger">
            Failed to load HIP-4 markets
          </div>
        ) : questions.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
            No active outcome markets
          </div>
        ) : (
          questions.map((q, i) => (
            <OutcomeRow key={`${q.question_id ?? q.title}-${i}`} question={q} />
          ))
        )}
      </div>
    </Card>
  );
});
