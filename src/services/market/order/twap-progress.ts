import type { EnrichedTwapOrder } from './types';

/** What `doneFraction` needs of a TWAP, whatever shape the caller holds it in. */
export interface TwapProgressInput {
  /** Full size in coin units. */
  size: number;
  /** Executed size known so far (0 when unknown). */
  executed: number;
  /** `executed` covers the whole TWAP (tracked since its start). */
  exact: boolean;
  /** Start, ms since epoch. */
  time: number;
  /** Duration in minutes. */
  durationMin: number;
}

/**
 * How far a running TWAP has got: the real executed share when the live feed
 * has followed the TWAP since its start (`exact`), otherwise the time elapsed
 * (one slice every 30 seconds over the duration) floored by whatever executed
 * size is known. 0..1. The one definition behind the board, the sort of the
 * dashboard panel and every progress bar, so they cannot disagree.
 */
export function doneFraction(p: TwapProgressInput, now: number): number {
  const executed = p.size > 0 ? Math.min(1, Math.max(0, p.executed / p.size)) : 0;
  if (p.exact) return executed;
  const duration = p.durationMin * 60_000;
  const elapsed = duration > 0 ? Math.min(1, Math.max(0, (now - p.time) / duration)) : 1;
  return Math.max(elapsed, executed);
}

/** `doneFraction` of an enriched order. */
export function twapDoneFraction(order: EnrichedTwapOrder, now: number): number {
  return doneFraction(
    {
      size: parseFloat(order.action.twap.s),
      executed: order.executedSz ?? 0,
      exact: order.executedExact === true,
      time: order.time,
      durationMin: order.action.twap.m,
    },
    now
  );
}

/** A running TWAP with no fill for this long, though tracked since its start, may not really be executing. */
export const TWAP_STALL_MS = 10 * 60_000;

/** Hyperliquid sends a TWAP suborder every 30 s, and only once it is worth at least $10. */
const SLICE_MS = 30_000;
const MIN_SUBORDER_USD = 10;

/**
 * Running on paper but not filling. Only judged when the tracking is exact (a
 * TWAP followed since its start, so "no fill" is a fact, not a gap in what the
 * feed saw) and past the first ten minutes, on two counts:
 * - no fill for three times the TWAP's own rhythm: a small TWAP waits until
 *   its slices add up to $10, so it fills every few minutes or hours (on
 *   2026-10-30, 109 TWAPs idle for 10 minutes all had slices under $10 and
 *   were on schedule);
 * - at least three slices behind its schedule (one that filled its first
 *   chunk ahead of time is only waiting).
 */
export function isTwapStalled(order: EnrichedTwapOrder, now: number): boolean {
  if (!order.executedExact) return false;
  const duration = order.action.twap.m * 60_000;
  if (duration <= 0 || now - order.time < TWAP_STALL_MS || now >= order.time + duration) return false;
  const slices = duration / SLICE_MS;
  const sliceUsd = order.totalValueUSD / slices;
  const rhythm = sliceUsd > 0 ? SLICE_MS * Math.max(1, MIN_SUBORDER_USD / sliceUsd) : SLICE_MS;
  if (now - (order.lastFillAt ?? order.time) < Math.max(TWAP_STALL_MS, 3 * rhythm)) return false;
  const size = parseFloat(order.action.twap.s);
  const behind = (now - order.time) / duration - (size > 0 ? (order.executedSz ?? 0) / size : 0);
  return behind * slices >= 3;
}
