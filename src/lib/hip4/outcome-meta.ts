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
  Hip4OutcomeMetaQuestion,
  Hip4QuestionWithOutcomesRow,
  Hip4QuestionOutcome,
  Hip4MarketEnrichedRow,
  Hip4LiveMarketData,
} from "@/services/indexer/hip4";
import { formatPriceBinaryTitle, isPlaceholderMarketName } from "./market-formatter";
import {
  EMPTY_TEMPLATE_INDEX,
  priceBucketFields,
  priceBucketOutcomeName,
  priceBucketQuestionTitle,
  renderSideName,
  renderTemplateRules,
  renderTemplateTitle,
  templateIdOf,
  templatePriceFields,
  type Hip4TemplateIndex,
} from "./market-names";

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

/** A description that is a template's keywords, not prose: never shown as rules. */
function rulesOf(
  name: string,
  description: string | null | undefined,
  templates: Hip4TemplateIndex
): string | null {
  return renderTemplateRules(name, description, templates) ?? (templateIdOf(name) ? null : description || null);
}

/** Title of an outcomeMeta question: its template, a price-bucket title, or its name. */
function questionTitleOf(q: Hip4OutcomeMetaQuestion, templates: Hip4TemplateIndex): string {
  return (
    renderTemplateTitle(q.name, q.description, templates) ||
    priceBucketQuestionTitle(q.description) ||
    (isPlaceholderMarketName(q.name) ? null : q.name) ||
    `Question #${q.question}`
  );
}

interface OutcomeView {
  title: string;
  sides: { name: string }[];
  isYesNo: boolean;
  cls: string | null;
  underlying: string | null;
  expiry: string | null;
  targetPrice: number | null;
  period: string | null;
}

/**
 * How one outcome reads: templated names rendered, legacy
 * `class:priceBinary|…` descriptions and price templates titled like each
 * other, a price bucket's `index:N` named after its range.
 */
function describeOutcome(
  o: Hip4OutcomeMetaEntry,
  question: Hip4OutcomeMetaQuestion | undefined,
  templates: Hip4TemplateIndex
): OutcomeView {
  const sidesRaw =
    Array.isArray(o.sideSpecs) && o.sideSpecs.length >= 1
      ? o.sideSpecs
      : [{ name: "Yes" }, { name: "No" }];
  const sides = sidesRaw
    .slice(0, 2)
    .map((s, i) => ({ name: renderSideName(s.name ?? "", o.description) ?? `Side ${i + 1}` }));
  const isYesNo =
    sides.length === 2 &&
    sides.some((s) => s.name.toLowerCase() === "yes") &&
    sides.some((s) => s.name.toLowerCase() === "no");

  const parsed = parseOutcomeDescription(o.description ?? "");
  const price = templatePriceFields(o.name, o.description);
  const bucket = question ? priceBucketFields(question.description) : null;
  const cls = parsed.cls ?? price?.cls ?? (bucket ? "priceBucket" : null);
  const underlying = parsed.underlying ?? price?.underlying ?? bucket?.underlying ?? null;
  const expiry = parsed.expiry ?? price?.expiry ?? bucket?.expiry ?? null;
  const targetPrice = parsed.targetPrice ?? price?.targetPrice ?? null;

  // Templates render from the registry; structured price markets get the
  // canonical title; everything else uses the outcome's own name (NBA/Fed/CPI
  // carry a human title there). Deployer placeholder names ("Recurring Named
  // Outcome", unrenderable templates) fall through to the id.
  const title =
    renderTemplateTitle(o.name, o.description, templates) ||
    (cls === "priceBinary" ? formatPriceBinaryTitle(underlying, targetPrice, expiry) : null) ||
    (question ? priceBucketOutcomeName(question.description, o.description) : null) ||
    (isPlaceholderMarketName(o.name) ? null : o.name) ||
    `Outcome #${o.outcome}`;

  return { title, sides, isYesNo, cls, underlying, expiry, targetPrice, period: parsed.period };
}

/**
 * Assemble live markets from `outcomeMeta` + `allMids` (+ optional per-encoding
 * volume from the indexer's analytics). Produces both the grid question rows and
 * a per-coin enriched-row map for the detail page and fills labels.
 *
 * An outcome of an outcomeMeta question (a match's teams and draw, a rate
 * decision, a price bucket) is one row of that question's card, priced by its
 * Yes coin; the question's residual fallback outcome is left out. Every other
 * outcome is a card of its own, with its two sides.
 */
export function buildLiveMarkets(
  meta: Hip4OutcomeMetaEntry[],
  mids: Record<string, string>,
  volByEncoding: Record<number, number> = {},
  templates: Hip4TemplateIndex = EMPTY_TEMPLATE_INDEX,
  metaQuestions: Hip4OutcomeMetaQuestion[] = []
): Hip4LiveMarketData {
  const questions: Hip4QuestionWithOutcomesRow[] = [];
  const marketsByCoin: Record<string, Hip4MarketEnrichedRow> = {};

  const questionOf = new Map<number, Hip4OutcomeMetaQuestion>();
  for (const q of metaQuestions) {
    for (const id of q.namedOutcomes ?? []) questionOf.set(id, q);
    if (q.fallbackOutcome != null) questionOf.set(q.fallbackOutcome, q);
  }
  const views = new Map<number, OutcomeView>();

  for (const o of meta) {
    const question = questionOf.get(o.outcome);
    const view = describeOutcome(o, question, templates);
    views.set(o.outcome, view);
    const questionTitle = question ? questionTitleOf(question, templates) : view.title;
    const rules = question
      ? rulesOf(question.name, question.description, templates)
      : rulesOf(o.name, o.description, templates);

    const outcomes: Hip4QuestionOutcome[] = view.sides.map((s, side) => {
      const enc = o.outcome * 10 + side;
      const coin = `#${enc}`;
      const mid = toNum(mids[coin]);
      const vol = volByEncoding[enc] ?? null;

      marketsByCoin[coin] = {
        outcome_id: enc,
        question_id: question ? question.question : o.outcome,
        coin,
        class: view.cls,
        class_normalized: view.isYesNo ? "binary" : "custom",
        underlying: view.underlying,
        // The readable name (the merge relabels duplicated indexer labels with it).
        name: view.title,
        side,
        side_name: s.name,
        parsed_sides: view.sides,
        token_name: `+${enc}`,
        question_name: questionTitle,
        question_description: rules,
        display_name: view.title,
        short_name: view.title,
        mid_price: mid,
        volume_24h: null,
        total_volume: vol,
        total_trades: null,
        open_interest: null,
        is_settled: false,
        settled_at: null,
        expiry: view.expiry,
        period: view.period,
        target_price: view.targetPrice,
      };

      return {
        outcome_id: enc,
        side_name: s.name,
        display_name: s.name,
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

    if (question) continue; // one row of its question's card, below

    const totalVolume = outcomes.reduce((acc, x) => acc + (x.total_volume ?? 0), 0);

    questions.push({
      question_id: null,
      title: view.title,
      description: rules,
      class: view.cls,
      underlying: view.underlying,
      outcome_count: outcomes.length,
      total_volume: totalVolume,
      created_at: null,
      resolved_at: null,
      status: "live",
      singleton_outcome_id: outcomes[0]?.outcome_id ?? null,
      expiry: view.expiry,
      period: view.period,
      target_price: view.targetPrice,
      // Synthetic outcomes already carry encoded side coins (`#<10*outcome>`),
      // so the first one is directly tradeable.
      primary_coin: outcomes[0] != null ? `#${outcomes[0].outcome_id}` : null,
      outcomes,
    });
  }

  for (const q of metaQuestions) {
    const settledNamed = new Set(q.settledNamedOutcomes ?? []);
    const outcomes: Hip4QuestionOutcome[] = (q.namedOutcomes ?? [])
      .filter((id) => views.has(id))
      .map((id) => {
        const yesCoin = `#${id * 10}`;
        const yesVol = volByEncoding[id * 10];
        const noVol = volByEncoding[id * 10 + 1];
        return {
          // The Yes coin's encoding, like the synthetic outcomes: its raw
          // outcome id is `rawOutcomeId(outcome_id)`.
          outcome_id: id * 10,
          side_name: null,
          display_name: views.get(id)!.title,
          mid_price: toNum(mids[yesCoin]),
          volume_24h: null,
          total_volume: yesVol == null && noVol == null ? null : (yesVol ?? 0) + (noVol ?? 0),
          open_interest: null,
          is_settled: settledNamed.has(id),
          settled_at: null,
          coin: yesCoin,
        };
      });
    if (outcomes.length === 0) continue;

    const bucket = priceBucketFields(q.description);
    questions.push({
      question_id: q.question,
      title: questionTitleOf(q, templates),
      description: rulesOf(q.name, q.description, templates),
      class: bucket ? "priceBucket" : null,
      underlying: bucket?.underlying ?? null,
      outcome_count: outcomes.length,
      total_volume: outcomes.reduce((acc, x) => acc + (x.total_volume ?? 0), 0),
      created_at: null,
      resolved_at: null,
      status: settledNamed.size > 0 ? "settled" : "live",
      singleton_outcome_id: null,
      expiry: bucket?.expiry ?? null,
      period: null,
      target_price: null,
      primary_coin: outcomes[0].coin,
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
