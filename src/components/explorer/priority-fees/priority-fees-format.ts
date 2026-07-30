import type { PriorityFeesBucket, PriorityFeesSeriesWindow } from "@/services/explorer/priority-fees";

const MS_PER_HOUR = 3_600_000;
const HOURS_PER_YEAR = 8_760;

/** Lookback each series window covers, in hours. Mirrors the backend ladder. */
const SERIES_WINDOW_HOURS: Record<PriorityFeesSeriesWindow, number> = {
  "24h": 24,
  "7d": 168,
};

/** Leaderboard hours matching a series window, so both read the same period. */
export function seriesWindowToHours(window: PriorityFeesSeriesWindow): number {
  return SERIES_WINDOW_HOURS[window];
}

/**
 * Hours a bucket actually spans.
 *
 * Not always the nominal width: the upstream sometimes clamps a lookback short,
 * which widens the neighbouring slice. Charting the raw amount would then draw
 * a four-hour bar and a seven-hour bar at the same width, so every rate on this
 * page divides by the span rather than by the bucket size.
 */
export function bucketSpanHours(bucket: PriorityFeesBucket): number {
  const hours = (bucket.end - bucket.start) / MS_PER_HOUR;
  return hours > 0 ? hours : 1;
}

/** Convert a HYPE amount to USD, or null when no price is available. */
export function hypeToUsd(hype: number | null | undefined, hypeUsd: number | null): number | null {
  if (hype === null || hype === undefined || !Number.isFinite(hype)) return null;
  if (hypeUsd === null || !Number.isFinite(hypeUsd) || hypeUsd <= 0) return null;
  return hype * hypeUsd;
}

/**
 * Straight-line extrapolation of a window's burn to a year. Not a forecast:
 * priority demand tracks volatility, which does not hold still for 365 days.
 */
export function annualizeHype(gas: number, spanHours: number): number | null {
  if (!Number.isFinite(gas) || !Number.isFinite(spanHours) || spanHours <= 0) return null;
  return (gas / spanHours) * HOURS_PER_YEAR;
}

/** Share of `total` held by `part`, as a percentage string. */
export function formatShare(part: number, total: number | null | undefined): string {
  if (!Number.isFinite(part) || total == null || !Number.isFinite(total) || total <= 0) return "—";
  const pct = (part / total) * 100;
  if (pct > 0 && pct < 0.01) return "<0.01%";
  return `${pct.toFixed(pct >= 10 ? 1 : 2)}%`;
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
