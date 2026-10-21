"use client";

import { memo } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useHip4ActiveMarkets } from "@/services/indexer/hip4";
import type { Hip4QuestionWithOutcomesRow } from "@/services/indexer/hip4";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { CardHead, SourceBadge, chartPalette, sourceStatus } from "@/components/common";
import {
  formatExpiryCountdown,
  headlineOutcomes,
  hip4QuestionKey,
  isBinaryQuestion,
} from "@/lib/hip4/market-formatter";

/**
 * Hip4OutcomesCard — top live HIP-4 markets by volume, the list page's Live
 * pill (`useHip4ActiveMarkets`).
 *
 * Card-head V4 purple (to distinguish from HIP-3 cyan). Each row:
 * truncated title, Yes/No pair (or the two favourites) with mid_price in
 * cents, cumulative volume, and countdown to expiry.
 */

const TOP_N = 5;

/** Multi-outcome colors: the list page's, for the same outcome (`Hip4OutcomeBar`). */
const PALETTE = chartPalette.multiSeries;

/** mid_price (0-1) → cents arrondis (ex. 0.682 → "68¢"). */
function priceToCents(mid: number | null | undefined): string {
  if (mid == null || !Number.isFinite(mid)) return "—";
  return `${Math.round(mid * 100)}¢`;
}

function OutcomeRow({
  question,
  showVolume,
}: {
  question: Hip4QuestionWithOutcomesRow;
  /** False when no volume is known: an unknown volume is not $0. */
  showVolume: boolean;
}) {
  const title = question.title ?? "Untitled market";
  const countdown = formatExpiryCountdown(question.expiry ?? null);
  const binary = isBinaryQuestion(question);
  // Yes then No, or the two favourites.
  const outcomes = headlineOutcomes(question, 2);

  return (
    <div className="px-3.5 py-2.5 border-b border-border-subtle last:border-b-0">
      <div className="text-[12px] font-semibold text-text-primary line-clamp-2 mb-1.5">
        {title}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        {outcomes.map((o, i) => {
          // Green/red only on a Yes/No market (Yes first). Team names, buckets
          // and "Change"/"No change" keep their palette color.
          const yesNo = binary ? (i === 0 ? "success" : "danger") : null;
          const color = yesNo ? undefined : PALETTE[question.outcomes.indexOf(o) % PALETTE.length];
          return (
            <span
              key={`${o.outcome_id}-${i}`}
              className={`flex items-center gap-1 min-w-0 mono font-semibold ${
                yesNo === "success" ? "text-success" : yesNo === "danger" ? "text-danger" : ""
              }`}
              style={color ? { color } : undefined}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  yesNo === "success" ? "bg-success" : yesNo === "danger" ? "bg-danger" : "bg-current"
                }`}
              />
              <span className="truncate" title={o.display_name}>{o.display_name}</span>
              <span className="shrink-0">{priceToCents(o.mid_price)}</span>
            </span>
          );
        })}
        <span className="text-text-tertiary mono ml-auto shrink-0 whitespace-nowrap">
          {showVolume ? `${compactUsd(question.total_volume)} vol` : null}
        </span>
        {countdown && (
          <span className="text-text-tertiary mono text-[10px] whitespace-nowrap shrink-0 inline-flex items-center gap-1">
            <Clock size={10} />
            {countdown.replace("Expires in ", "")}
          </span>
        )}
      </div>
    </div>
  );
}

export const Hip4OutcomesCard = memo(function Hip4OutcomesCard() {
  const { questions, totalVolume, activeCount, volumesMissing, isLoading, error, isStale } =
    useHip4ActiveMarkets(TOP_N);

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="HIP-4 Outcomes"
        tag={
          // No count while loading or failed: "0 live · $0 vol" would read as a fact.
          isLoading || error ? undefined : (
            <>
              {activeCount} live
              {!volumesMissing && (
                <>
                  {" · "}
                  <span className="mono">{compactUsd(totalVolume)} vol</span>
                </>
              )}
            </>
          )
        }
        actions={<SourceBadge source="hypedexer" status={sourceStatus(error, isLoading, isStale)} />}
        href="/market/hip4"
      />

      <div className="flex-1">
        {isLoading && questions.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
            Loading…
          </div>
        ) : error && questions.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[11px] text-danger">
            Failed to load HIP-4 markets
          </div>
        ) : questions.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
            No active outcome markets
          </div>
        ) : (
          questions.map((q) => (
            <OutcomeRow key={hip4QuestionKey(q)} question={q} showVolume={!volumesMissing} />
          ))
        )}
      </div>
    </Card>
  );
});
