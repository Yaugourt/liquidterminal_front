/** Preset window lengths (hours) for stats and leaderboard. */
export const PRIORITY_FEES_WINDOW_HOURS = [1, 6, 24, 72, 168] as const;

/** UI label: short hours stay "Nh"; 24/72/168 use day wording. */
export function formatPriorityFeesWindowLabel(hours: number): string {
  switch (hours) {
    case 1:
      return "1h";
    case 6:
      return "6h";
    case 24:
      return "1 day";
    case 72:
      return "3 days";
    case 168:
      return "7 days";
    default:
      return `${hours}h`;
  }
}

/**
 * Display helpers for priority-fee numeric fields (may be string from indexer).
 * HypeDexer priority gas can be very small; `maximumFractionDigits: 4` alone rounds
 * e.g. 0.00002 to "0", which looks like missing data.
 */
export function formatPriorityFeeNumber(value: unknown): string {
  if (value === null || value === undefined) return "—";

  let n: number;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "—";
    n = value;
  } else if (typeof value === "string" && value.trim() !== "") {
    n = Number(value);
    if (!Number.isFinite(n)) return value;
  } else {
    return "—";
  }

  if (n === 0) return "0";

  const abs = Math.abs(n);
  const maxFrac =
    abs >= 1 ? 4 : abs >= 1e-4 ? 6 : abs >= 1e-8 ? 10 : 12;

  return n.toLocaleString("en-US", {
    maximumFractionDigits: maxFrac,
  });
}

export function toFiniteNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Compact HYPE display for linear annualized burn (e.g. `5.12K` for thousands).
 */
export function formatAnnualizedLinearHype(hype: number): string {
  if (!Number.isFinite(hype)) return "—";
  if (hype >= 1000) return `${(hype / 1000).toFixed(2)}K`;
  return formatPriorityFeeNumber(hype);
}

/**
 * HypeDexer `SideEnum`: **B = Buy**, **A = Sell** (see OpenAPI on `/fills/recent` `side` param).
 */
export function formatFillSideLabel(side: unknown): string {
  if (side === null || side === undefined || side === "") return "—";
  const s = String(side).trim();
  const u = s.toUpperCase();
  if (u === "B" || u === "BUY") return "Buy";
  if (u === "A" || u === "SELL") return "Sell";
  return s;
}

export function isFillSideBuy(side: unknown): boolean {
  const s = String(side ?? "").trim().toUpperCase();
  return s === "B" || s === "BUY";
}

export function isFillSideSell(side: unknown): boolean {
  const s = String(side ?? "").trim().toUpperCase();
  return s === "A" || s === "SELL";
}
