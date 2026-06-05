/**
 * HIP-4 detail-page layout resolver — the single source for "given a question +
 * its outcomes, how should the detail page render?".
 *
 * GENERIC-FIRST by design. The canonical model is one question + N (≥2) mutually
 * exclusive outcomes, and the base layout renders ANY such question correctly
 * without code changes — so future market types (elections, multi-candidate,
 * whatever ships next) fall through to the right shape automatically. Known
 * types are *progressive enhancements* layered on top, never preconditions:
 *
 *   • price-binary (BTC above X?) → adds the underlying candle + strike line.
 *   • versus (2 non-Yes/No sides: NBA teams, Fed change/no-change) → 2-card framing.
 *   • binary (literal Yes/No)     → green/red polarity.
 *   • multi (N>2 buckets/candidates: CPI, elections, custom) → selectable ladder.
 *
 * The implied-probability ("odds over time") chart is the UNIVERSAL chart — it
 * works for every type. The underlying price+strike chart is an extra view that
 * only price-binary markets expose.
 */

import type {
  Hip4MarketEnrichedRow,
  Hip4QuestionWithOutcomesRow,
} from "@/services/indexer/hip4";
import { isYesNoSides } from "./market-formatter";

export type Hip4MarketKind = "price-binary" | "binary" | "versus" | "multi";

/** How the outcomes panel renders. */
export type Hip4OutcomesVariant = "binary" | "versus" | "ladder";

/** Which chart is primary in the chart region. */
export type Hip4ChartMode = "underlying" | "probability";

export interface Hip4DetailLayout {
  kind: Hip4MarketKind;
  /** Outcomes-list rendering style. */
  outcomesVariant: Hip4OutcomesVariant;
  /** True only for literal Yes/No — drives green/red polarity. Everything else
   *  (teams, change/no-change, buckets) stays neutral. */
  isYesNo: boolean;
  /** True when the underlying price + strike chart is available (price-binary). */
  hasUnderlyingChart: boolean;
  /** Default primary chart. `probability` (universal) unless this is a single
   *  threshold on an underlying, where the candle view leads. */
  defaultChartMode: Hip4ChartMode;
  /** Outcome count after residual filtering (drives the multi-outcome label). */
  outcomeCount: number;
  /** Short uppercase tag for the header (e.g. "Yes / No", "Versus", "3 outcomes"). */
  typeLabel: string;
}

/**
 * Resolve the layout from the parent (merged) question and the active market
 * row. Falls back gracefully when one is missing — the page can render the
 * generic shape from whichever it has.
 */
export function resolveHip4Layout({
  question,
  market,
}: {
  question: Hip4QuestionWithOutcomesRow | null;
  market: Hip4MarketEnrichedRow | null;
}): Hip4DetailLayout {
  // Outcome labels: prefer the question's (covers buckets/candidates); fall back
  // to the active market's parsed sides for a lone live coin with no question.
  const outcomeNames: string[] = question
    ? question.outcomes.map((o) => o.display_name)
    : (market?.parsed_sides ?? []).map((s) => s.name);

  const outcomeCount = Math.max(outcomeNames.length, market?.parsed_sides?.length ?? 0);
  const isYesNo = isYesNoSides(outcomeNames);

  const cls = (question?.class ?? market?.class ?? "").toLowerCase();
  const underlying = question?.underlying ?? market?.underlying ?? null;
  // A single-threshold price market: needs an underlying to plot a candle and a
  // strike. priceBucket (N thresholds) deliberately does NOT qualify — it has no
  // single strike, so it uses the universal odds chart like everything else.
  const isPriceBinary =
    isYesNo &&
    !!underlying &&
    (cls === "pricebinary" || (outcomeCount <= 2 && market?.target_price != null));

  let kind: Hip4MarketKind;
  if (isPriceBinary) kind = "price-binary";
  else if (isYesNo) kind = "binary";
  else if (outcomeCount === 2) kind = "versus";
  else kind = "multi";

  const outcomesVariant: Hip4OutcomesVariant =
    kind === "multi" ? "ladder" : kind === "versus" ? "versus" : "binary";

  const hasUnderlyingChart = kind === "price-binary";
  const defaultChartMode: Hip4ChartMode = hasUnderlyingChart ? "underlying" : "probability";

  let typeLabel: string;
  if (kind === "price-binary") typeLabel = underlying ? `${underlying} · Binary` : "Binary";
  else if (kind === "binary") typeLabel = "Yes / No";
  else if (kind === "versus") typeLabel = "Versus";
  else typeLabel = `${outcomeCount} outcomes`;

  return {
    kind,
    outcomesVariant,
    isYesNo,
    hasUnderlyingChart,
    defaultChartMode,
    outcomeCount,
    typeLabel,
  };
}
