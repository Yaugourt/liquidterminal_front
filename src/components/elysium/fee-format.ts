/**
 * HYPE fee amounts on Elysium run from whole units down to millionths (gas is
 * priced at 0.01 gwei), so the precision follows the size instead of a fixed
 * scale. Plain module: shared by the page and the share tile.
 */
export function fmtHypeFee(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "–";
  if (v === 0) return "0";
  if (v >= 1) return v.toFixed(2);
  if (v >= 0.001) return v.toFixed(4);
  return `${(v * 1e6).toFixed(v * 1e6 >= 10 ? 0 : 1)}µ`;
}
