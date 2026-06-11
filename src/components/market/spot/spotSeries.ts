import type { FeesHistoryEntry } from "@/services/market/fees/types";
import type { TokenCandle } from "@/services/market/token/types";

/**
 * Cumulative `total_spot_fees` series → one delta per UTC day (last sample of
 * each day). The Hypurrscan window only covers ~10 days, so callers must label
 * the chart with the actual span instead of pretending it's 30d/90d.
 */
export function dailySpotFeeDeltas(
  history: FeesHistoryEntry[] | null
): { time: number; value: number }[] {
  if (!history || history.length === 0) return [];
  const byDay = new Map<string, number>();
  for (const e of history) {
    const day = String(e.time).slice(0, 10);
    if (day.length === 10) byDay.set(day, e.total_spot_fees);
  }
  const days = [...byDay.keys()].sort();
  const out: { time: number; value: number }[] = [];
  for (let i = 1; i < days.length; i++) {
    const delta = (byDay.get(days[i]) ?? 0) - (byDay.get(days[i - 1]) ?? 0);
    const time = Date.parse(`${days[i]}T00:00:00Z`);
    if (Number.isFinite(delta) && delta >= 0 && Number.isFinite(time)) {
      out.push({ time, value: delta });
    }
  }
  return out;
}

/** OHLC candles → `{time, value}` close series for area charts / sparklines. */
export function candleCloses(
  candles: TokenCandle[]
): { time: number; value: number }[] {
  return candles
    .map((c) => ({ time: c.T, value: parseFloat(c.c) }))
    .filter((p) => Number.isFinite(p.time) && Number.isFinite(p.value));
}
