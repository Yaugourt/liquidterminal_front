import { useMemo, useRef } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4OutcomeCandles } from "../api";
import type { Hip4Candle, Hip4CandleInterval } from "../types";

/**
 * Full re-read period of the candle series. The chart shows up to 9 series,
 * each a browser-direct candleSnapshot (Hyperliquid weight 20 + 1 per 60
 * candles, on the visitor's own 1,200/min IP budget): ~180 weight a poll, so
 * 30s keeps a HIP-4 tab near 360/min and leaves room for a second tab or the
 * visitor's own trading. The forming candle follows the live mids (15s) in
 * between, at no extra weight — see `liveTip`.
 */
const CANDLE_POLL_MS = 30_000;

const NO_CANDLES: Record<string, Hip4Candle[]> = {};

/**
 * Fetch OHLC candles for each outcome coin of a question in parallel — the clean
 * implied-probability source for LIVE coins (the fills-reconstructed series is
 * the fallback for expired coins, which have no candle feed).
 *
 * With `prev` (the series already on screen for the same coins/window), a coin
 * only re-reads from its last candle — the one still forming; earlier candles
 * are final — and the answer is merged into its series. A coin whose read
 * fails keeps its previous series (a rate-limited poll must not erase a line
 * from the chart); one that never loaded degrades to an empty series rather
 * than failing the whole chart.
 */
async function fetchCandlesForCoins(
  coins: string[],
  interval: Hip4CandleInterval,
  startTime: number,
  prev: Record<string, Hip4Candle[]>
): Promise<Record<string, Hip4Candle[]>> {
  const entries = await Promise.all(
    coins.map(async (coin): Promise<[string, Hip4Candle[]]> => {
      const known = prev[coin];
      const last = known && known.length > 0 ? known[known.length - 1] : undefined;
      const since = last ? Math.max(startTime, last.t) : startTime;
      try {
        const fresh = await fetchHip4OutcomeCandles(coin, interval, since);
        if (!known || !last) return [coin, fresh];
        if (fresh.length === 0) return [coin, known];
        return [coin, [...known.filter((c) => c.t < since), ...fresh]];
      } catch {
        return [coin, known ?? []];
      }
    })
  );
  return Object.fromEntries(entries);
}

/**
 * The forming candle (the last one, when the mids' time falls inside it)
 * closes at the live mid, widening its high/low if needed. Candles are only
 * re-read every `CANDLE_POLL_MS`; this keeps the line's tip in step with the
 * odds header without another candleSnapshot.
 */
function liveTip(
  candlesByCoin: Record<string, Hip4Candle[]>,
  mids: Record<string, string> | undefined,
  midsAt: number | null | undefined
): Record<string, Hip4Candle[]> {
  if (!mids || midsAt == null) return candlesByCoin;
  let changed = false;
  const out: Record<string, Hip4Candle[]> = {};
  for (const [coin, series] of Object.entries(candlesByCoin)) {
    out[coin] = series;
    const last = series[series.length - 1];
    const mid = mids[coin];
    const px = mid != null ? Number(mid) : NaN;
    if (!last || !Number.isFinite(px) || midsAt < last.t || midsAt > last.T) continue;
    const h = Math.max(Number(last.h), px);
    const l = Math.min(Number(last.l), px);
    out[coin] = [...series.slice(0, -1), { ...last, c: mid, h: String(h), l: String(l) }];
    changed = true;
  }
  return changed ? out : candlesByCoin;
}

export interface UseHip4OutcomeCandlesResult {
  candlesByCoin: Record<string, Hip4Candle[]>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHip4OutcomeCandles(
  coins: string[],
  interval: Hip4CandleInterval,
  startTime: number,
  enabled = true,
  /** Live mids (`#<encoding>` → probability) and their fetch time: the
   * forming candle follows them between candle polls. */
  live?: { mids: Record<string, string>; at: number | null }
): UseHip4OutcomeCandlesResult {
  const active = enabled && coins.length > 0;
  // Stable cache key — re-fetch only when the coin set, interval or window moves.
  const key = `${[...coins].sort().join(",")}|${interval}|${startTime}`;
  // The series of the last successful read, for incremental polls and for a
  // failed coin to fall back on. Only reused for the same key.
  const lastRef = useRef<{ key: string; data: Record<string, Hip4Candle[]> } | null>(null);

  const { data, isLoading, error, refetch } = useDataFetching<Record<string, Hip4Candle[]>>({
    fetchFn: async () => {
      if (!active) return {};
      const prev = lastRef.current?.key === key ? lastRef.current.data : {};
      const next = await fetchCandlesForCoins(coins, interval, startTime, prev);
      lastRef.current = { key, data: next };
      return next;
    },
    refreshInterval: active ? CANDLE_POLL_MS : 600000,
    dependencies: [key, active],
    maxRetries: 2,
  });

  const mids = live?.mids;
  const midsAt = live?.at;
  const candlesByCoin = useMemo(() => liveTip(data ?? NO_CANDLES, mids, midsAt), [data, mids, midsAt]);

  return {
    candlesByCoin,
    isLoading,
    error,
    refetch,
  };
}
