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
  /**
   * Running TWAPs only: the last fill the live feed saw (epoch ms; null: none
   * yet). Given, both shares move with the clock between two fills (see
   * `doneFraction`); left out, an exact share waits for the next fill and an
   * estimated one is the time elapsed.
   */
  lastFillAt?: number | null;
  /** Full notional in USD: sizes the $10 chunk a small TWAP fills in (see `nextFillShare`). */
  totalUsd?: number;
}

/** Hyperliquid sends a TWAP suborder every 30 s, and only once it is worth at least $10. */
const SLICE_MS = 30_000;
const MIN_SUBORDER_USD = 10;

/**
 * Share of the TWAP its next fill takes on schedule: one 30 s slice, or the
 * $10 chunk a small TWAP waits for when its slices are worth less.
 */
function nextFillShare(duration: number, totalUsd: number | undefined): number {
  const slice = SLICE_MS / duration;
  return totalUsd !== undefined && totalUsd > 0 ? Math.max(slice, MIN_SUBORDER_USD / totalUsd) : slice;
}

/**
 * How far a running TWAP has got, 0..1: the real executed share when the live
 * feed has followed the TWAP since its start (`exact`), otherwise the time
 * elapsed (the schedule spreads the size evenly over the duration) floored by
 * whatever executed size is known. The one definition behind the board, the
 * sort of the dashboard panel and every progress bar, so they cannot disagree.
 *
 * Given `lastFillAt` (a running TWAP), both move with the clock between two
 * fills, so what is left goes down every second:
 * - An exact share only moves when a fill lands: the clock runs it on from
 *   the last fill at the schedule's pace, by no more than the next fill's
 *   share, and it meets the real share again at each fill. A TWAP that stops
 *   filling stops there, one fill ahead at most. The clock stops at the
 *   scheduled end too, so the share holds there until the last fill or the
 *   final status lands instead of stepping back.
 * - An estimated share is the time elapsed plus one slice, where a TWAP on
 *   schedule stands: Hyperliquid sends the first suborder within seconds of
 *   the start, so right after a fill the executed share is up to a slice
 *   ahead of the clock (0.7 of a slice at the median, measured on
 *   2026-11-03). Floored by the time alone, a nearly complete executed size
 *   (every running TWAP after the backend's upstream reconnects, until it
 *   seeds them again) held the share still between fills. Not run on from
 *   `lastFillAt`: the executed size may be the polled one, older than the
 *   feed's last fill, and would step back at each fill.
 */
export function doneFraction(p: TwapProgressInput, now: number): number {
  const executed = p.size > 0 ? Math.min(1, Math.max(0, p.executed / p.size)) : 0;
  const duration = p.durationMin * 60_000;
  const running = p.lastFillAt !== undefined && duration > 0;
  if (p.exact) {
    if (!running) return executed;
    const sinceFill = Math.max(0, Math.min(now, p.time + duration) - (p.lastFillAt ?? p.time));
    return Math.min(1, executed + Math.min(nextFillShare(duration, p.totalUsd), sinceFill / duration));
  }
  const elapsed = duration > 0 ? Math.min(1, Math.max(0, (now - p.time) / duration)) : 1;
  const scheduled = running ? Math.min(1, elapsed + SLICE_MS / duration) : elapsed;
  return Math.max(scheduled, executed);
}

/** `doneFraction` of an enriched order: a running one moves with the clock between two fills. */
export function twapDoneFraction(order: EnrichedTwapOrder, now: number): number {
  const running = !order.ended && !order.error;
  return doneFraction(
    {
      size: parseFloat(order.action.twap.s),
      executed: order.executedSz ?? 0,
      exact: order.executedExact === true,
      time: order.time,
      durationMin: order.action.twap.m,
      lastFillAt: running ? order.lastFillAt ?? null : undefined,
      totalUsd: order.totalValueUSD,
    },
    now
  );
}

/** A running TWAP with no fill for this long, though tracked since its start, may not really be executing. */
export const TWAP_STALL_MS = 10 * 60_000;

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
