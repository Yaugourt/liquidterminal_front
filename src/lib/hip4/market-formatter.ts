import type {
  Hip4MarketEnrichedRow,
  Hip4QuestionOutcome,
  Hip4QuestionWithOutcomesRow,
} from "@/services/indexer/hip4";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function parseExpiry(expiry: string): Date | null {
  const m = expiry.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})$/);
  if (!m) return null;
  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00Z`);
}

export function formatExpiryDate(expiry: string): string {
  const m = expiry.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})$/);
  if (!m) return expiry;
  const month = MONTHS[parseInt(m[2]) - 1];
  const day = parseInt(m[3]);
  const hh = parseInt(m[4]);
  const mm = m[5];
  const ampm = hh < 12 ? "AM" : "PM";
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  const time = mm === "00" ? `${h12}:00 ${ampm}` : `${h12}:${mm} ${ampm}`;
  return `${month} ${day} at ${time} UTC`;
}

/** Canonical "BTC above 67,297 on Jun 4 at 6:00 AM UTC?" title for a priceBinary
 * market. Returns null when the structured fields aren't all present (caller
 * falls back to the market's own name). Shared by `formatMarketTitle` and the
 * outcomeMeta live-market builder. */
export function formatPriceBinaryTitle(
  underlying: string | null,
  targetPrice: number | null,
  expiry: string | null
): string | null {
  if (!underlying || targetPrice == null || !expiry) return null;
  const price =
    targetPrice >= 1000
      ? targetPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : String(targetPrice);
  return `${underlying} above ${price} on ${formatExpiryDate(expiry)}?`;
}

/**
 * True for upstream template names that are not real market titles (recurring
 * markets ship the literal deployer placeholder "Recurring Named Outcome";
 * templated markets a `template:<id>` reference, rendered upstream of here
 * when the registry is available). Callers must fall back to an
 * id/ticker-derived label instead of rendering it.
 */
export function isPlaceholderMarketName(name: string | null | undefined): boolean {
  const n = (name ?? "").trim().toLowerCase();
  return n === "" || n === "recurring named outcome" || n === "recurring" || n.startsWith("template");
}

export function formatMarketTitle(market: Hip4MarketEnrichedRow): string {
  if (market.class === "priceBinary") {
    const t = formatPriceBinaryTitle(market.underlying, market.target_price, market.expiry);
    if (t) return t;
  }
  if (!isPlaceholderMarketName(market.display_name)) return market.display_name;
  return market.coin || "Unknown market";
}

/**
 * Stable React key for a question card. `question_id` and `singleton_outcome_id`
 * share one number space (question 20 and singleton outcome 20 both exist), and
 * ~50 HypeDexer rows carry neither, so key on the id kind + the outcome ids.
 */
export function hip4QuestionKey(q: Hip4QuestionWithOutcomesRow): string {
  if (q.question_id != null) return `q${q.question_id}`;
  return `o${q.outcomes.map((o) => o.outcome_id).join("-")}`;
}

/**
 * The detail page a question links to: its tradeable primary coin
 * (`#<10*outcome+side>`, set by the live-market builder and the merge), or the
 * raw outcome coin for legacy callers. Null without any outcome.
 */
export function hip4QuestionHref(q: Hip4QuestionWithOutcomesRow): string | null {
  const coin = q.primary_coin ?? (q.outcomes[0] != null ? `#${q.outcomes[0].outcome_id}` : null);
  return coin ? `/market/hip4/${encodeURIComponent(coin)}` : null;
}

export type Hip4EffectiveStatus = "live" | "expired_unresolved" | "closed" | "settled";

/**
 * Display status that corrects the indexer's stale "live" classification.
 *
 * `/indexer/hip4/questions-with-outcomes` keeps `status:"live"` for markets that
 * are past expiry but not yet settled on-chain (~121 of 142 "live" rows at the
 * time of writing), which renders a wall of expired markets badged green "Live"
 * with empty 0% probability bars. We re-derive: a past-expiry "live" market is
 * actually awaiting resolution. No-expiry / future-expiry live markets stay
 * live, and `settled` / `closed` / `expired_unresolved` are passed through
 * untouched (`closed` is set by the question merge).
 *
 * Pure display logic — never mutate `question.status`.
 */
export function effectiveStatus(
  q: Pick<Hip4QuestionWithOutcomesRow, "status" | "expiry">
): Hip4EffectiveStatus {
  if (q.status === "settled") return "settled";
  if (q.status === "closed") return "closed";
  if (q.status === "expired_unresolved") return "expired_unresolved";
  const d = q.expiry ? parseExpiry(q.expiry) : null;
  if (d && d.getTime() <= Date.now()) return "expired_unresolved";
  return "live";
}

/**
 * The list page's Closed filter: markets whose trading time is over with no
 * settlement on record, either no longer listed (`closed`) or past their
 * expiry and still listed (`expired_unresolved`). Their card badges tell the
 * two apart.
 */
export function countsAsClosed(status: Hip4EffectiveStatus): boolean {
  return status === "closed" || status === "expired_unresolved";
}

/**
 * True for the protocol's residual "none-of-the-above" outcome that every
 * grouped question carries (raw outcome 100/150, surfaced by HypeDexer as
 * "Other / Disputed" and by Hyperliquid's outcomeMeta as "Fallback"). It never
 * has real liquidity, so its YES coin is quoted at a flat 0.5 — rendering a
 * permanent "Other · 50%" row. Other HL front-ends hide it; so do we.
 */
export function isResidualOutcome(name: string | null | undefined): boolean {
  const n = (name ?? "").trim().toLowerCase();
  return (
    n === "other / disputed" ||
    n === "other" ||
    n === "fallback" ||
    n === "recurring fallback" ||
    n === "template fallback"
  );
}

/** True iff exactly two side names that are "Yes" and "No" (case-insensitive).
 * The single source for "is this a Yes/No binary" — green/red polarity tokens
 * apply ONLY here; Change/No-Change, team names, buckets stay neutral. */
export function isYesNoSides(names: Array<string | null | undefined>): boolean {
  if (names.length !== 2) return false;
  const lower = names.map((n) => (n ?? "").toLowerCase());
  return lower.includes("yes") && lower.includes("no");
}

/** A binary HIP-4 question has exactly two outcomes whose display names are
 * "Yes" and "No" (set by enrichment). Anything else (priceBucket, multi-outcome
 * custom) must be rendered with neutral labels and colors — Yes/No semantics
 * don't apply. */
export function isBinaryQuestion(question: Hip4QuestionWithOutcomesRow): boolean {
  return isYesNoSides(question.outcomes.map((o) => o.display_name));
}

/**
 * The outcomes a one-line summary shows, first one leading: a Yes/No market's
 * Yes then No; any other question's priciest outcomes (its favourites), the
 * unpriced ones last in their own order. Shared by the dashboard card and the
 * market hub lane.
 */
export function headlineOutcomes(
  question: Hip4QuestionWithOutcomesRow,
  max: number
): Hip4QuestionOutcome[] {
  if (isBinaryQuestion(question)) {
    const side = (name: string) =>
      question.outcomes.find((o) => (o.display_name ?? "").toLowerCase() === name);
    return [side("yes"), side("no")]
      .filter((o): o is Hip4QuestionOutcome => o != null)
      .slice(0, max);
  }
  const price = (o: Hip4QuestionOutcome) =>
    o.mid_price != null && Number.isFinite(o.mid_price) ? o.mid_price : -1;
  return question.outcomes
    .map((o, i) => ({ o, i }))
    .sort((a, b) => price(b.o) - price(a.o) || a.i - b.i)
    .slice(0, max)
    .map(({ o }) => o);
}

export function formatExpiryCountdown(expiry: string | null): string | null {
  if (!expiry) return null;
  const expiryDate = parseExpiry(expiry);
  if (!expiryDate) return null;
  const diffMs = expiryDate.getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) {
    const diffM = Math.floor(diffMs / 60_000);
    return `Expires in ${diffM}m`;
  }
  if (diffH < 24) return `Expires in ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Expires in ${diffD}d`;
}

/** `key:value|key:value` description fields (HIP-4 questions and outcomes). */
export function descriptionFields(desc: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (desc ?? "").split("|")) {
    const i = part.indexOf(":");
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

/**
 * Title for a recurring price-bucket question, built only from its own
 * description (`class:priceBucket|underlying:BTC|expiry:…|priceThresholds:a,b`).
 * Null when a field is missing, so callers keep their own fallback.
 */
export function formatPriceBucketTitle(desc: string | null | undefined): string | null {
  const f = descriptionFields(desc);
  if (f.class !== "priceBucket" || !f.underlying || !f.expiry) return null;
  const bounds = (f.priceThresholds ?? "")
    .split(",")
    .map((x) => Number(x))
    .filter((x) => Number.isFinite(x) && x > 0)
    .map((x) => x.toLocaleString("en-US", { maximumFractionDigits: 0 }));
  const range = bounds.length ? ` · ${bounds.join(" / ")}` : "";
  return `${f.underlying} price range on ${formatExpiryDate(f.expiry)}${range}`;
}
