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

/**
 * The tradeable Yes-side coin of a raw outcome id, live or not: Hyperliquid
 * (and the indexer's fills) always name it `#<10*raw>`. The indexer's raw
 * `#<raw>` label is another market's coin (`#20` is outcome 2's Yes side).
 */
export function yesCoinOf(rawId: number): string {
  return `#${rawId * 10}`;
}

export function buildMergedQuestions(
  hypeQuestions: Hip4QuestionWithOutcomesRow[],
  live: LiveMarketsLike
): Hip4QuestionWithOutcomesRow[] {
  const mids = live.mids;
  const liveRawIds = new Set<number>(
    live.liveQuestions.flatMap((q) => q.outcomes.map((o) => rawOutcomeId(o.outcome_id)))
  );

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
          coin: yesCoinOf(o.outcome_id),
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

/**
 * A looked-up market with no question, as the detail page's question: its two
 * sides, each on its own coin `#<10*outcome+side>` (the market row is one of
 * them). Prices only exist while a market trades, so a side other than the
 * row's own carries none.
 */
export function sideCoinsQuestion(market: Hip4MarketEnrichedRow): Hip4QuestionWithOutcomesRow {
  const raw = market.side != null ? rawOutcomeId(market.outcome_id) : market.outcome_id;
  const sides = market.parsed_sides?.length ? market.parsed_sides.slice(0, 2) : [{ name: "Yes" }, { name: "No" }];
  const outcomes = sides.map((s, side) => ({
    outcome_id: raw * 10 + side,
    side_name: s.name,
    display_name: s.name,
    mid_price: side === market.side ? market.mid_price : null,
    volume_24h: null,
    total_volume: null,
    open_interest: null,
    is_settled: market.is_settled,
    settled_at: market.settled_at,
    coin: `#${raw * 10 + side}`,
  }));
  return {
    question_id: null,
    title: market.display_name,
    description: market.question_description,
    class: market.class,
    underlying: market.underlying,
    outcome_count: outcomes.length,
    total_volume: market.total_volume ?? 0,
    created_at: null,
    resolved_at: market.settled_at,
    status: market.is_settled ? "settled" : "live",
    singleton_outcome_id: null,
    expiry: market.expiry,
    period: market.period,
    target_price: market.target_price,
    primary_coin: outcomes[0].coin,
    outcomes,
  };
}

/**
 * A looked-up question (indexer rows: raw outcome ids) with each outcome on
 * its tradeable Yes coin and the residual outcome dropped, like the merge.
 */
export function withYesCoins(question: Hip4QuestionWithOutcomesRow): Hip4QuestionWithOutcomesRow {
  const outcomes = question.outcomes
    .filter((o) => !isResidualOutcome(o.display_name))
    .map((o) => ({ ...o, coin: yesCoinOf(o.outcome_id) }));
  return {
    ...question,
    outcomes,
    outcome_count: outcomes.length,
    primary_coin: outcomes[0]?.coin ?? null,
  };
}
