/**
 * Shared TWAP calculation utilities.
 *
 * Used by both `dashboard/twap/TwapTable` and `explorer/address/orders/UserTwapTable`.
 * Each call site keeps its own visual choices (progress bar palette, cell layout) —
 * this module owns the time/progression math only.
 */

import { doneFraction } from "./twap-progress";

/**
 * Minimal input shape for real-time TWAP progression.
 * Compatible with both `TwapTableData` from dashboard and explorer.
 */
export interface TwapProgressionInput {
  id: string;
  /** Order start time, ms since epoch. */
  time: number;
  /** Total duration in minutes. */
  duration: number;
  /** Original total quantity, as a stringified number. */
  amount: string;
  /** Original total value in USD. */
  value: number;
  /** Executed size known from the live feed, when there is one. */
  executedSz?: number;
  /** `executedSz` covers the whole TWAP: progress is the executed share, not the time. */
  executedExact?: boolean;
}

export interface TwapRealTimeData {
  /** 0–100 percentage. */
  progression: number;
  /** Remaining USD value. */
  remainingValue: number;
  /** Remaining base-asset amount. */
  remainingAmount: number;
  /** True once `progression >= 100`. */
  isCompleted: boolean;
}

/**
 * Compute the current TWAP progression: the same fraction as the dashboard
 * board (`doneFraction`), the executed share when it is exact, otherwise the
 * elapsed time floored by the executed size. Remaining quantity and value
 * scale linearly with what is left. `now` ticks every second in the hook.
 */
export function calculateRealTimeProgression(twap: TwapProgressionInput, now: number = Date.now()): TwapRealTimeData {
  const originalAmount = parseFloat(twap.amount);
  const fraction = doneFraction(
    {
      size: originalAmount,
      executed: twap.executedSz ?? 0,
      exact: twap.executedExact === true,
      time: twap.time,
      durationMin: twap.duration,
    },
    now
  );
  const remaining = 1 - fraction;
  const progression = fraction * 100;

  return {
    progression,
    remainingValue: Math.max(0, twap.value * remaining),
    remainingAmount: Number.isFinite(originalAmount) ? originalAmount * remaining : 0,
    isCompleted: progression >= 100,
  };
}

/**
 * Format remaining time as a compact human-readable string.
 * Returns "Completed" when no time is left.
 */
export function getRemainingTime(twap: Pick<TwapProgressionInput, "time" | "duration">): string {
  const durationMs = twap.duration * 60 * 1000;
  const remainingMs = Math.max(0, durationMs - (Date.now() - twap.time));

  if (remainingMs === 0) return "Completed";

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
