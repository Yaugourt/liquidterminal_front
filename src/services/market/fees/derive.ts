import type { FeesHistoryEntry } from "./types";

/** Fees accrued inside one clock hour, split by book. */
export interface FeeFlowBucket {
  /** Start of the hour (ms). */
  time: number;
  /** Perp fees, derived as total less spot. */
  perp: number;
  spot: number;
  total: number;
}

const HOUR_MS = 3_600_000;

/**
 * Turn the raw fee counter into an hourly flow.
 *
 * `/market/fees/raw` samples a lifetime cumulative total roughly every ten
 * minutes. The level is not interesting on its own — it only ever goes up —
 * but the difference between two samples is the fees the venue charged in
 * between, which is the operating rate nothing else publishes at this
 * resolution.
 *
 * A pair whose difference is negative is dropped rather than clamped. The
 * counter is cumulative, so a decrease means the sampler restarted or the rows
 * arrived out of order, and a clamped zero would read as an hour with no
 * trading.
 *
 * The first and last buckets are dropped: both are partial hours, and a half
 * hour drawn next to full ones reads as a collapse in activity.
 */
export function toHourlyFeeFlow(entries: FeesHistoryEntry[] | null | undefined): FeeFlowBucket[] {
  if (!entries || entries.length < 2) return [];

  const samples = entries
    .map((entry) => ({
      time: Date.parse(entry.time),
      total: entry.total_fees,
      spot: entry.total_spot_fees,
    }))
    .filter((s) => Number.isFinite(s.time) && Number.isFinite(s.total) && Number.isFinite(s.spot))
    .sort((a, b) => a.time - b.time);

  const buckets = new Map<number, FeeFlowBucket>();

  for (let i = 1; i < samples.length; i += 1) {
    const previous = samples[i - 1];
    const current = samples[i];

    const total = current.total - previous.total;
    const spot = current.spot - previous.spot;
    if (total < 0 || spot < 0 || spot > total) continue;

    const key = Math.floor(current.time / HOUR_MS) * HOUR_MS;
    const bucket = buckets.get(key) ?? { time: key, perp: 0, spot: 0, total: 0 };
    bucket.perp += total - spot;
    bucket.spot += spot;
    bucket.total += total;
    buckets.set(key, bucket);
  }

  const ordered = [...buckets.values()].sort((a, b) => a.time - b.time);
  return ordered.length > 2 ? ordered.slice(1, -1) : [];
}
