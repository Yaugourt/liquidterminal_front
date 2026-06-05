/**
 * Merge HypeDexer's `/questions-with-outcomes` with the canonical Hyperliquid
 * live markets (outcomeMeta + allMids). Shared by the HIP-4 list page and the
 * detail page so both resolve the *same* set of grouped questions, tradeable
 * coins and labels.
 *
 * HypeDexer represents the live outcomes two ways:
 *   • broken singleton "ghosts" (one outcome, wrong fallback title, no price)
 *     for Fed/NBA/recurring-BTC → dropped, the synthetic version is correct.
 *   • properly grouped multi-outcome questions (CPI, price buckets) that are
 *     just missing prices → kept and enriched with mid_price from allMids.
 * Synthetic cards are only added where HypeDexer has no good grouped question.
 *
 * Every surviving outcome is tagged with its encoded, tradeable `coin`
 * (`#<10*outcome+side>`) and each question with a `primary_coin`, so the detail
 * page lands on a coin that actually has prices/fills instead of HypeDexer's
 * raw-outcome coin (`#103`, which is priceless).
 */

import type {
  Hip4QuestionWithOutcomesRow,
  Hip4MarketEnrichedRow,
} from "@/services/indexer/hip4";
import { isResidualOutcome } from "./market-formatter";
import { liveMidForOutcomeId, rawOutcomeId } from "./outcome-meta";

interface LiveMarketsLike {
  liveQuestions: Hip4QuestionWithOutcomesRow[];
  mids: Record<string, string>;
  liveMarketsByCoin: Record<string, Hip4MarketEnrichedRow>;
}

export function buildMergedQuestions(
  hypeQuestions: Hip4QuestionWithOutcomesRow[],
  live: LiveMarketsLike
): Hip4QuestionWithOutcomesRow[] {
  const mids = live.mids;
  const liveRawIds = new Set<number>(
    live.liveQuestions.flatMap((q) => q.outcomes.map((o) => rawOutcomeId(o.outcome_id)))
  );

  // The encoded, tradeable YES-side coin for a HypeDexer raw outcome id. Prefer
  // whichever scheme is actually quoted in allMids so the detail page lands on a
  // coin with real prices/fills; fall back to the raw coin (still enriched-
  // backed) for old markets that aren't live-quoted.
  const tradeableCoin = (rawId: number): string => {
    const enc = `#${rawId * 10}`;
    const self = `#${rawId}`;
    return mids[enc] != null ? enc : mids[self] != null ? self : self;
  };

  const enrichedHd: Hip4QuestionWithOutcomesRow[] = [];
  const wellGroupedRawIds = new Set<number>();

  for (const q of hypeQuestions) {
    const distinct = new Set(q.outcomes.map((o) => o.outcome_id));
    const isGhost =
      distinct.size <= 1 && [...distinct].every((id) => liveRawIds.has(id));
    if (isGhost) continue;

    // Track grouping BEFORE dropping the residual outcome, so the synthetic
    // standalone version of every grouped raw id (incl. the Fallback) is still
    // suppressed below.
    if (distinct.size >= 2) {
      for (const id of distinct) if (liveRawIds.has(id)) wellGroupedRawIds.add(id);
    }

    // HypeDexer sometimes labels several outcomes of a grouped question the
    // same (e.g. CPI's three buckets all read "May CPI year-over-year"). For
    // those duplicated labels only, fall back to the canonical per-outcome name
    // from outcomeMeta (the Yes-side coin's `name`); distinct labels (price
    // buckets) are left untouched.
    const labelCounts = new Map<string, number>();
    for (const o of q.outcomes) {
      labelCounts.set(o.display_name, (labelCounts.get(o.display_name) ?? 0) + 1);
    }
    const outcomes = q.outcomes
      // Drop the residual "Other / Disputed" bucket — no liquidity, flat 50%.
      .filter((o) => !isResidualOutcome(o.display_name))
      .map((o) => {
        const isDuplicated = (labelCounts.get(o.display_name) ?? 0) > 1;
        const metaName = live.liveMarketsByCoin[`#${o.outcome_id * 10}`]?.name;
        return {
          ...o,
          display_name: isDuplicated && metaName ? metaName : o.display_name,
          mid_price: o.mid_price ?? liveMidForOutcomeId(o.outcome_id, mids),
          coin: tradeableCoin(o.outcome_id),
        };
      });

    if (outcomes.length === 0) continue;

    enrichedHd.push({
      ...q,
      outcomes,
      outcome_count: outcomes.length,
      primary_coin: outcomes[0].coin,
    });
  }

  const extra = live.liveQuestions
    .filter((q) => {
      const raw = q.outcomes.length ? rawOutcomeId(q.outcomes[0].outcome_id) : null;
      return raw == null || !wellGroupedRawIds.has(raw);
    })
    // Defensive: never surface a standalone Fallback/placeholder card.
    .filter((q) => !isResidualOutcome(q.title));

  return [...extra, ...enrichedHd];
}

/**
 * Find the merged question a coin belongs to, matched by raw outcome id so it
 * works for either side coin (`#1030` / `#1031`) and for both id schemes.
 */
export function findMergedQuestionByCoin(
  merged: Hip4QuestionWithOutcomesRow[],
  coin: string
): Hip4QuestionWithOutcomesRow | null {
  const m = coin.match(/^#(\d+)$/);
  if (!m) return null;
  const target = rawOutcomeId(parseInt(m[1], 10));
  for (const q of merged) {
    for (const o of q.outcomes) {
      const oc = o.coin ?? `#${o.outcome_id}`;
      const om = oc.match(/^#(\d+)$/);
      if (om && rawOutcomeId(parseInt(om[1], 10)) === target) return q;
    }
  }
  return null;
}
