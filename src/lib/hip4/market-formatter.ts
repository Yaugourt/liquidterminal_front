import type { Hip4MarketEnrichedRow, Hip4QuestionWithOutcomesRow } from "@/services/indexer/hip4";

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
 * markets ship the literal deployer placeholder "Recurring Named Outcome").
 * Callers must fall back to an id/ticker-derived label instead of rendering it.
 */
export function isPlaceholderMarketName(name: string | null | undefined): boolean {
  const n = (name ?? "").trim().toLowerCase();
  return n === "" || n === "recurring named outcome" || n === "recurring";
}

export function formatMarketTitle(market: Hip4MarketEnrichedRow): string {
  if (market.class === "priceBinary") {
    const t = formatPriceBinaryTitle(market.underlying, market.target_price, market.expiry);
    if (t) return t;
  }
  if (!isPlaceholderMarketName(market.display_name)) return market.display_name;
  return market.coin || "Unknown market";
}

export type Hip4EffectiveStatus = "live" | "expired_unresolved" | "settled";

/**
 * Display status that corrects the indexer's stale "live" classification.
 *
 * `/indexer/hip4/questions-with-outcomes` keeps `status:"live"` for markets that
 * are past expiry but not yet settled on-chain (~121 of 142 "live" rows at the
 * time of writing), which renders a wall of expired markets badged green "Live"
 * with empty 0% probability bars. We re-derive: a past-expiry "live" market is
 * actually awaiting resolution. No-expiry / future-expiry live markets stay
 * live, and `settled` / `expired_unresolved` are passed through untouched.
 *
 * Pure display logic — never mutate `question.status`. This becomes a no-op
 * fallback once the backend exposes `is_expired_unresolved` on this endpoint
 * (it already ships it on `markets-enriched`).
 */
export function effectiveStatus(
  q: Pick<Hip4QuestionWithOutcomesRow, "status" | "expiry">
): Hip4EffectiveStatus {
  if (q.status === "settled") return "settled";
  if (q.status === "expired_unresolved") return "expired_unresolved";
  const d = q.expiry ? parseExpiry(q.expiry) : null;
  if (d && d.getTime() <= Date.now()) return "expired_unresolved";
  return "live";
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
    n === "recurring fallback"
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

/** "4,926" style number for titles; non-numeric input passes through. */
function titleNum(v: string): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : v;
}

/**
 * Title for an outcome deployed from a HIP-4 template (`template:…` names),
 * built only from fields of its own description and of its grouping question
 * (Hyperliquid outcomeMeta), e.g. a tournament participant becomes
 * "Arsenal · English Premier League 2026/2027". Null when the template or its
 * fields are not recognised, so callers keep their own fallback.
 */
export function formatTemplateOutcomeTitle(
  name: string | null | undefined,
  desc: string | null | undefined,
  question?: { name: string; description: string }
): string | null {
  const n = (name ?? "").trim();
  if (!n.startsWith("template")) return null;
  const f = descriptionFields(desc);
  const q = descriptionFields(question?.description);
  const league = [q.competition, q.season].filter(Boolean).join(" ");
  const matchA = f.participantA ?? q.participantA;
  const matchB = f.participantB ?? q.participantB;
  const match = matchA && matchB ? `${matchA} vs ${matchB}` : null;
  const date = (v?: string) => (v ? formatExpiryDate(v) : null);

  switch (n) {
    case "template:sportsTournamentParticipant":
      return f.participant ? (league ? `${f.participant} · ${league}` : f.participant) : null;
    case "template:sportsContestParticipant2":
      return f.participant && match ? `${f.participant} wins · ${match}` : f.participant ?? null;
    case "template:sportsContestDraw2":
      return match ? `Draw · ${match}` : null;
    case "template:sportsContestWinner":
      return match ? (f.competition ? `${match} · ${f.competition}` : match) : null;
    case "template:sportsSpread": {
      const side = f.shortNameA ?? matchA;
      return side && f.spread && match ? `${side} ${f.spread} · ${match}` : null;
    }
    case "template:sportsTotal":
      return f.line && match ? `${match} · total ${f.measure ?? ""} ${f.line}`.replace(/\s+/g, " ") : null;
    case "template:binaryPrice": {
      const asset = f.perp ?? f.spot;
      return asset && f.threshold ? `${asset} vs ${titleNum(f.threshold)}${f.time ? ` · ${date(f.time)}` : ""}` : null;
    }
    case "template:priceTouch": {
      const asset = f.perp ?? f.spot;
      return asset && f.target ? `${asset} touches ${titleNum(f.target)}${f.time ? ` by ${date(f.time)}` : ""}` : null;
    }
    case "template:companyIpoConfirmed":
      return f.company ? `${f.company} IPO confirmed${f.dateTime ? ` by ${date(f.dateTime)}` : ""}` : null;
    case "template:policyRateNoChange":
    case "template:policyRateDecrease":
    case "template:policyRateIncrease": {
      const move = n.endsWith("NoChange") ? "No change" : n.endsWith("Decrease") ? "Rate decrease" : "Rate increase";
      return q.decisionLabel ? `${move} · ${q.decisionLabel} decision` : move;
    }
    case "template fallback":
      // The question's catch-all outcome: none of the named ones.
      return league ? `Other · ${league}` : match ? `Other · ${match}` : null;
    default:
      return null;
  }
}

/**
 * Side label of a template outcome: drops the `template:` prefix and fills
 * `{shortNameA}` style placeholders from the outcome description.
 */
export function formatTemplateSide(side: string | null | undefined, desc: string | null | undefined): string | null {
  if (!side) return null;
  if (!side.startsWith("template:")) return side;
  const f = descriptionFields(desc);
  const bare = side.slice("template:".length);
  const ph = bare.match(/^\{(\w+)\}$/);
  return ph ? f[ph[1]] ?? bare : bare;
}
