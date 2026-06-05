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

export function formatMarketTitle(market: Hip4MarketEnrichedRow): string {
  if (market.class === "priceBinary") {
    const t = formatPriceBinaryTitle(market.underlying, market.target_price, market.expiry);
    if (t) return t;
  }
  return market.display_name || market.coin || "Unknown market";
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

/** Variant + Tailwind class for an outcome label. Binary Yes/No keep
 * green/red; everything else uses the brand cyan or a palette index. */
export function getOutcomeVariant(
  displayName: string,
  index: number,
  isBinary: boolean
): { variant: "success" | "danger" | "brand"; label: string } {
  if (isBinary && displayName === "Yes") return { variant: "success", label: "Yes" };
  if (isBinary && displayName === "No") return { variant: "danger", label: "No" };
  return { variant: "brand", label: displayName || `Outcome ${index + 1}` };
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
