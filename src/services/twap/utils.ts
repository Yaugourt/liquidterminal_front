/**
 * Shared TWAP calculation utilities.
 *
 * Used by both `dashboard/twap/TwapTable` and `explorer/address/orders/UserTwapTable`.
 * Each call site keeps its own visual choices (progress bar palette, cell layout) —
 * this module owns the time/progression math only.
 */

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
}

export interface TwapRealTimeData {
  /** 0–100 percentage. */
  progression: number;
  /** Remaining USD value (linear vs elapsed time). */
  remainingValue: number;
  /** Remaining base-asset amount. */
  remainingAmount: number;
  /** True once `progression >= 100`. */
  isCompleted: boolean;
}

/**
 * Compute the current TWAP progression as a smooth function of elapsed time
 * (not the discrete number of suborders). Remaining quantity and value scale
 * linearly with the remaining time fraction.
 */
export function calculateRealTimeProgression(twap: TwapProgressionInput): TwapRealTimeData {
  const startTime = twap.time;
  const durationMs = twap.duration * 60 * 1000; // minutes → ms
  const elapsedTime = Date.now() - startTime;

  const timeProgressionPercent = Math.min(100, Math.max(0, (elapsedTime / durationMs) * 100));
  const remainingPercent = Math.max(0, 100 - timeProgressionPercent);

  const originalAmount = parseFloat(twap.amount);
  const remainingAmount = originalAmount * (remainingPercent / 100);
  const remainingValue = remainingAmount * (twap.value / originalAmount);

  return {
    progression: timeProgressionPercent,
    remainingValue: Math.max(0, remainingValue),
    remainingAmount,
    isCompleted: timeProgressionPercent >= 100,
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
