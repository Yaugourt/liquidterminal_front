/**
 * Reconstruct an implied-probability time series for one or more HIP-4 outcome
 * coins. Two sources:
 *   • LIVE coins → `candleSnapshot` OHLC (clean, regularly spaced) via
 *     `buildProbabilitySeriesFromCandles` — preferred.
 *   • EXPIRED coins (no candle feed) → the raw fills feed, where every fill
 *     carries `px` (0–1 = implied probability) + `time`, bucketed into a
 *     step-forward series by `buildProbabilitySeries` — the fallback.
 * Both emit the same `{ rows, series, bucketMs }` shape the chart consumes.
 */

import type { Hip4FillRow, Hip4Candle } from "@/services/indexer/hip4";

export interface ProbSeriesDef {
  /** Encoded outcome coin, e.g. `#1030`. */
  coin: string;
  label: string;
}

interface ProbSeriesMeta {
  key: string;
  label: string;
}

export interface ProbChartData {
  /** One row per time bucket: `{ t, [coin]: pct|null, ... }`. */
  rows: Array<Record<string, number | null>>;
  series: ProbSeriesMeta[];
  /** Chosen bucket width (ms) — drives axis/tooltip time formatting. */
  bucketMs: number;
}

// Candidate bucket widths, smallest → largest.
const NICE_BUCKETS = [
  60_000, // 1m
  5 * 60_000,
  15 * 60_000,
  30 * 60_000,
  60 * 60_000, // 1h
  4 * 3_600_000,
  12 * 3_600_000,
  24 * 3_600_000, // 1d
  7 * 24 * 3_600_000,
];

// Hard cap on the number of buckets, so a single corrupt/extreme fill timestamp
// can't expand the grid into millions of rows and freeze the render thread.
const MAX_BUCKETS = 300;

// Plausible timestamp window — reject fills dated before 2020 or past 2100
// (HypeDexer is unstable and can emit garbage rows). 2020-01-01 / 2100-01-01.
const MIN_T = 1_577_836_800_000;
const MAX_T = 4_102_444_800_000;

function niceBucket(spanMs: number, target = 80): number {
  if (!Number.isFinite(spanMs) || spanMs <= 0) return NICE_BUCKETS[0];
  const raw = spanMs / target;
  for (const b of NICE_BUCKETS) if (b >= raw) return b;
  return NICE_BUCKETS[NICE_BUCKETS.length - 1];
}

export function buildProbabilitySeries(
  fillsByCoin: Record<string, Hip4FillRow[]>,
  defs: ProbSeriesDef[]
): ProbChartData {
  const series = defs.map((d) => ({ key: d.coin, label: d.label }));

  // Parse each series' fills into ascending {t, px} points. Reject NaN and
  // out-of-window timestamps so one garbage row can't distort the time span.
  const parsed = defs.map((d) => {
    const pts = (fillsByCoin[d.coin] ?? [])
      .map((f) => ({ t: Date.parse(f.time), px: f.px }))
      .filter(
        (p) =>
          Number.isFinite(p.t) &&
          p.t >= MIN_T &&
          p.t <= MAX_T &&
          Number.isFinite(p.px)
      )
      .sort((a, b) => a.t - b.t);
    return { coin: d.coin, pts };
  });

  const allT = parsed.flatMap((p) => p.pts.map((x) => x.t));
  if (allT.length === 0) return { rows: [], series, bucketMs: NICE_BUCKETS[0] };

  const tMin = Math.min(...allT);
  const tMax = Math.max(...allT);
  const span = tMax - tMin;

  // Pick a nice bucket, then widen it if the span would still exceed the cap.
  let bucketMs = niceBucket(span);
  if (span / bucketMs > MAX_BUCKETS) bucketMs = Math.ceil(span / MAX_BUCKETS);

  // Anchor the first point at the first actual trade (not a floored bucket
  // edge) so the line starts exactly where the market began trading, and a
  // single trade still yields one non-null opening point. Always append tMax so
  // the most recent trade is captured.
  const times: number[] = [];
  for (let t = tMin; t < tMax; t += bucketMs) times.push(t);
  times.push(tMax);

  const rows = times.map((t) => {
    const row: Record<string, number | null> = { t };
    for (const p of parsed) {
      // Step-forward: last trade at or before this bucket edge. null until the
      // first trade so the line starts where the market started trading.
      let px: number | null = null;
      for (let i = p.pts.length - 1; i >= 0; i--) {
        if (p.pts[i].t <= t) {
          px = p.pts[i].px;
          break;
        }
      }
      row[p.coin] = px != null ? Math.max(0, Math.min(100, px * 100)) : null;
    }
    return row;
  });

  return { rows, series, bucketMs };
}

/**
 * Build the same series shape from `candleSnapshot` OHLC. Candles are already
 * regularly spaced and aligned to interval boundaries, so we align on the union
 * of open-times and forward-fill each coin's close (= implied probability).
 * Preferred over the fills reconstruction for live coins (cleaner, fewer points).
 */
export function buildProbabilitySeriesFromCandles(
  candlesByCoin: Record<string, Hip4Candle[]>,
  defs: ProbSeriesDef[]
): ProbChartData {
  const series = defs.map((d) => ({ key: d.coin, label: d.label }));

  const parsed = defs.map((d) => {
    const pts = (candlesByCoin[d.coin] ?? [])
      .map((c) => ({ t: c.t, px: parseFloat(c.c) }))
      .filter((p) => Number.isFinite(p.t) && p.t >= MIN_T && p.t <= MAX_T && Number.isFinite(p.px))
      .sort((a, b) => a.t - b.t);
    return { coin: d.coin, pts };
  });

  const allT = Array.from(new Set(parsed.flatMap((p) => p.pts.map((x) => x.t)))).sort(
    (a, b) => a - b
  );
  if (allT.length === 0) return { rows: [], series, bucketMs: 3_600_000 };

  // Bucket width from the candle's own [t, T] span (T is close-1ms).
  let bucketMs = 3_600_000;
  for (const d of defs) {
    const c = (candlesByCoin[d.coin] ?? [])[0];
    if (c && c.T > c.t) {
      bucketMs = c.T - c.t + 1;
      break;
    }
  }

  // Guard against a pathological union (shouldn't happen — candles are capped).
  const times = allT.length > MAX_BUCKETS ? allT.slice(allT.length - MAX_BUCKETS) : allT;

  const rows = times.map((t) => {
    const row: Record<string, number | null> = { t };
    for (const p of parsed) {
      let px: number | null = null;
      for (let i = p.pts.length - 1; i >= 0; i--) {
        if (p.pts[i].t <= t) {
          px = p.pts[i].px;
          break;
        }
      }
      row[p.coin] = px != null ? Math.max(0, Math.min(100, px * 100)) : null;
    }
    return row;
  });

  return { rows, series, bucketMs };
}
