"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, Vote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useHip4ActiveMarkets } from "@/services/indexer/hip4";
import type {
  Hip4QuestionOutcome,
  Hip4QuestionWithOutcomesRow,
} from "@/services/indexer/hip4";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { formatExpiryCountdown } from "@/lib/hip4/market-formatter";
import { chartPalette } from "@/components/common";

/**
 * Hip4OutcomesCard — top marchés HIP-4 ouverts par volume.
 *
 * Card-head V4 violet (pour différencier du HIP-3 cyan). Chaque rangée :
 * titre tronqué, paire Yes/No (ou 2 premiers outcomes) avec leur mid_price
 * en cents, volume cumulé et countdown jusqu'à expiry.
 */

const TOP_N = 5;

const HIP4_VIOLET = chartPalette.violet;

/** Couleur "fixée" pour une outcome Yes/No (binaire) ou par index. */
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
            <span key={o.outcome_id} className="flex items-center gap-1">
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
          <span className="text-text-tertiary mono text-[10px] whitespace-nowrap">
            {countdown.replace("Expires in ", "⏳ ")}
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
      {/* card-head V4 violet */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span
          className="w-6 h-6 rounded-md grid place-items-center shrink-0"
          style={{ background: `${HIP4_VIOLET}1A` }}
        >
          <Vote size={13} style={{ color: HIP4_VIOLET }} />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          HIP-4 Outcomes
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          {activeCount} live
        </span>
        <span
          className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded mono"
          style={{
            background: `${HIP4_VIOLET}1A`,
            color: HIP4_VIOLET,
            border: `1px solid ${HIP4_VIOLET}40`,
          }}
        >
          {compactUsd(totalVolume)} vol
        </span>
        <Link
          href="/market/hip4"
          className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          View all
          <ArrowRight size={12} />
        </Link>
      </div>

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
          questions.map((q) => (
            <OutcomeRow key={q.question_id ?? q.title} question={q} />
          ))
        )}
      </div>
    </Card>
  );
});
