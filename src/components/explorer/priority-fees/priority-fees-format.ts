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
