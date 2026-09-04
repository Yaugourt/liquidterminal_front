/**
 * Minimal SVG path builder for share-tile trend charts.
 *
 * Satori cannot run a charting library, so a series is drawn as two `<path>`
 * `d` strings (a stroked line and a filled area) in a fixed 1000x150 viewBox;
 * the tile stretches it to the card width with `preserveAspectRatio="none"`.
 */
export function seriesPaths(
  values: number[],
  width = 1000,
  height = 150
): { line: string; area: string } {
  const n = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.15 || Math.abs(max) * 0.05 || 1;
  const lo = min - pad;
  const hi = max + pad;
  const x = (i: number) => (n === 1 ? width : (i / (n - 1)) * width);
  const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;
  const pts = values.map((v, i) => `${x(i).toFixed(1)} ${y(v).toFixed(1)}`);
  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  return { line, area };
}
