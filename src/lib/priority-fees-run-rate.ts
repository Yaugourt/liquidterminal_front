import type { PriorityFeesStats } from "@/services/explorer/priority-fees/types";

const MS_PER_DAY = 86_400_000;
/** Below this effective span (days), surface an "early window" hint in UI. */
export const PRIORITY_FEES_RUN_RATE_EARLY_WINDOW_DAYS = 7;
const MIN_EFFECTIVE_DAYS = 1 / 24;

export interface PriorityFeesRunRateResult {
  /** Calendar span from stats `time_range` (fractional days). */
  effectiveDays: number;
  /** `time_range` copy for display. */
  timeRange: { start: string; end: string } | null;
  totalPriorityGasHype: number;
  fillCount: number;
  hypePerDay: number;
  /** Linear extrapolation: `hypePerDay * 365` — not a forecast. */
  annualizedLinearHype: number;
  earlyWindow: boolean;
}

function parseIsoMs(iso: string | undefined): number | null {
  if (!iso || typeof iso !== "string") return null;
  const d = Date.parse(iso);
  return Number.isFinite(d) ? d : null;
}

function parseTotalGas(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function parseFillCount(stats: PriorityFeesStats): number {
  const a = stats.total_fills_with_priority;
  const b = stats.fills_with_priority;
  if (typeof a === "number" && Number.isFinite(a)) return a;
  if (typeof b === "number" && Number.isFinite(b)) return b;
  return 0;
}

/**
 * Derives honest run-rate metrics from HypeDexer priority-fees stats.
 * Always uses **`time_range` duration**, not the requested `hours` query alone.
 */
export function computePriorityFeesRunRate(
  stats: PriorityFeesStats | null
): PriorityFeesRunRateResult | null {
  if (!stats?.time_range) return null;
  const start = stats.time_range.start;
  const end = stats.time_range.end;
  const startMs = parseIsoMs(start);
  const endMs = parseIsoMs(end);
  if (startMs === null || endMs === null || endMs <= startMs) return null;

  const spanMs = endMs - startMs;
  const effectiveDays = Math.max(spanMs / MS_PER_DAY, MIN_EFFECTIVE_DAYS);
  const totalPriorityGasHype = parseTotalGas(stats.total_priority_gas);
  const fillCount = parseFillCount(stats);
  const hypePerDay = totalPriorityGasHype / effectiveDays;
  const annualizedLinearHype = hypePerDay * 365;
  const earlyWindow = effectiveDays < PRIORITY_FEES_RUN_RATE_EARLY_WINDOW_DAYS;

  return {
    effectiveDays,
    timeRange: { start: start as string, end: end as string },
    totalPriorityGasHype,
    fillCount,
    hypePerDay,
    annualizedLinearHype,
    earlyWindow,
  };
}
