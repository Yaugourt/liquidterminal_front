/**
 * Build grid-ready question rows + per-coin enriched rows from Hyperliquid's
 * `outcomeMeta` + `allMids`. HypeDexer's aggregation tables
 * (`/markets-enriched`, `/questions-with-outcomes`) currently OMIT the live
 * markets (Fed/NBA/CPI/recurring BTC) even though it ingests their fills, so we
 * synthesize the missing rows from the canonical Hyperliquid source.
 *
 * Encoding identity (Hyperliquid asset-ID spec): a raw `outcome` N has two side
 * coins `#<10*N + side>` (side 0 / side 1). YES + NO mids sum to 1.0, i.e. each
 * mid is the implied probability of that side.
 */

import type {
  Hip4OutcomeMetaEntry,
  Hip4QuestionWithOutcomesRow,
  Hip4QuestionOutcome,
  Hip4MarketEnrichedRow,
  Hip4LiveMarketData,
} from "@/services/indexer/hip4";
import { formatPriceBinaryTitle, isPlaceholderMarketName } from "./market-formatter";

interface ParsedOutcomeDesc {
  cls: string | null;
  underlying: string | null;
  expiry: string | null;
  targetPrice: number | null;
  period: string | null;
  category: string | null;
}

const EMPTY_DESC: ParsedOutcomeDesc = {
  cls: null,
  underlying: null,
  expiry: null,
  targetPrice: null,
  period: null,
  category: null,
};

function pipeFields(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of s.split("|")) {
    const i = part.indexOf(":");
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

/**
 * Parse a HIP-4 outcome description. Three shapes occur in the wild:
 *   - structured price market: `class:priceBinary|underlying:BTC|expiry:20260604-0600|targetPrice:67297|period:1d`
 *   - prose with a trailing `metadata=category:sports|subCategory:basketball` (sports/macro)
 *   - freeform prose / placeholders (`other`, `index:0`, empty)
 * Only structured fields are extracted; prose stays null (the outcome `name` is
 * used as the title in that case).
 */
export function parseOutcomeDescription(desc: string): ParsedOutcomeDesc {
  if (!desc) return { ...EMPTY_DESC };
  const out: ParsedOutcomeDesc = { ...EMPTY_DESC };

  const metaMatch = desc.match(/metadata=(.+)$/);
  if (metaMatch) {
    out.category = pipeFields(metaMatch[1]).category ?? null;
  }

  if (/(^|\|)\s*class\s*:/.test(desc)) {
    const f = pipeFields(desc);
    out.cls = f.class ?? null;
    out.underlying = f.underlying ?? null;
    out.expiry = f.expiry ?? null;
    out.period = f.period ?? null;
    const tp = f.targetPrice != null ? Number(f.targetPrice) : NaN;
    out.targetPrice = Number.isFinite(tp) ? tp : null;
  }

  return out;
}

function toNum(v: string | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Assemble live markets from `outcomeMeta` + `allMids` (+ optional per-encoding
 * volume from the indexer's analytics). Produces both the grid question rows and
 * a per-coin enriched-row map for the detail page and fills labels.
 */
export function buildLiveMarkets(
  meta: Hip4OutcomeMetaEntry[],
  mids: Record<string, string>,
  volByEncoding: Record<number, number> = {}
): Hip4LiveMarketData {
  const questions: Hip4QuestionWithOutcomesRow[] = [];
  const marketsByCoin: Record<string, Hip4MarketEnrichedRow> = {};

  for (const o of meta) {
    const sidesRaw =
      Array.isArray(o.sideSpecs) && o.sideSpecs.length >= 1
        ? o.sideSpecs
        : [{ name: "Yes" }, { name: "No" }];
    const sides = sidesRaw.slice(0, 2);
    const parsed = parseOutcomeDescription(o.description ?? "");

    const isYesNo =
      sides.length === 2 &&
      sides.some((s) => s.name?.toLowerCase() === "yes") &&
      sides.some((s) => s.name?.toLowerCase() === "no");
    const classNormalized = isYesNo ? "binary" : "custom";

    // Structured price markets get the canonical title; everything else uses the
    // outcome's own name (NBA/Fed/CPI carry a human title there). Deployer
    // placeholder names ("Recurring Named Outcome") fall through to the id.
    const title =
      (parsed.cls === "priceBinary"
        ? formatPriceBinaryTitle(parsed.underlying, parsed.targetPrice, parsed.expiry)
        : null) ||
      (isPlaceholderMarketName(o.name) ? null : o.name) ||
      `Outcome #${o.outcome}`;

    const outcomes: Hip4QuestionOutcome[] = sides.map((s, side) => {
      const enc = o.outcome * 10 + side;
      const coin = `#${enc}`;
      const mid = toNum(mids[coin]);
      const vol = volByEncoding[enc] ?? null;

      marketsByCoin[coin] = {
        outcome_id: enc,
        question_id: o.outcome,
        coin,
        class: parsed.cls,
        class_normalized: classNormalized,
        underlying: parsed.underlying,
        name: o.name ?? null,
        side,
        side_name: s.name ?? null,
        parsed_sides: sides.map((x) => ({ name: x.name })),
        token_name: `+${enc}`,
        question_name: title,
        question_description: o.description || null,
        display_name: title,
        short_name: title,
        mid_price: mid,
        volume_24h: null,
        total_volume: vol,
        total_trades: null,
        open_interest: null,
        is_settled: false,
        settled_at: null,
        expiry: parsed.expiry,
        period: parsed.period,
        target_price: parsed.targetPrice,
      };

      return {
        outcome_id: enc,
        side_name: s.name ?? null,
        display_name: s.name || `Side ${side}`,
        mid_price: mid,
        volume_24h: null,
        total_volume: vol,
        open_interest: null,
        is_settled: false,
        settled_at: null,
        // Synthetic outcomes are themselves the encoded side coins.
        coin,
      };
    });

    const totalVolume = outcomes.reduce((acc, x) => acc + (x.total_volume ?? 0), 0);

    questions.push({
      question_id: null,
      title,
      description: o.description || null,
      class: parsed.cls,
      underlying: parsed.underlying,
      outcome_count: outcomes.length,
      total_volume: totalVolume,
      created_at: null,
      resolved_at: null,
      status: "live",
      singleton_outcome_id: outcomes[0]?.outcome_id ?? null,
      expiry: parsed.expiry,
      period: parsed.period,
      target_price: parsed.targetPrice,
      // Synthetic outcomes already carry encoded side coins (`#<10*outcome>`),
      // so the first one is directly tradeable.
      primary_coin: outcomes[0] != null ? `#${outcomes[0].outcome_id}` : null,
      outcomes,
    });
  }

  return { questions, marketsByCoin, mids };
}

/**
 * Live mid for a HypeDexer outcome, looked up in `allMids` under both id
 * schemes: HypeDexer stores some outcomes by encoding (`#200`) and the newer
 * grouped questions by raw outcome id (`#101`, whose Yes-side coin is `#1010`).
 * Returns null when neither is quoted (old/expired markets).
 */
export function liveMidForOutcomeId(
  outcomeId: number,
  mids: Record<string, string>
): number | null {
  return toNum(mids[`#${outcomeId}`]) ?? toNum(mids[`#${outcomeId * 10}`]);
}

/** Raw outcome id behind a synthetic question's encoded outcome id. */
export function rawOutcomeId(encoding: number): number {
  return Math.floor(encoding / 10);
}
