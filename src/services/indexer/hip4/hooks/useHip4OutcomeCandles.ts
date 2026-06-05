import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4OutcomeCandles } from "../api";
import type { Hip4Candle, Hip4CandleInterval } from "../types";

/**
 * Fetch OHLC candles for each outcome coin of a question in parallel — the clean
 * implied-probability source for LIVE coins (the fills-reconstructed series is
 * the fallback for expired coins, which have no candle feed). One slow/failing
 * coin degrades to an empty series rather than failing the whole chart.
 */
async function fetchCandlesForCoins(
  coins: string[],
  interval: Hip4CandleInterval,
  startTime: number
): Promise<Record<string, Hip4Candle[]>> {
  const entries = await Promise.all(
    coins.map(async (coin) => {
      try {
        return [coin, await fetchHip4OutcomeCandles(coin, interval, startTime)] as const;
      } catch {
        return [coin, [] as Hip4Candle[]] as const;
      }
    })
  );
  return Object.fromEntries(entries);
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
  enabled = true
): UseHip4OutcomeCandlesResult {
  const active = enabled && coins.length > 0;
  // Stable cache key — re-fetch only when the coin set, interval or window moves.
  const key = `${[...coins].sort().join(",")}|${interval}|${startTime}`;

  const { data, isLoading, error, refetch } = useDataFetching<Record<string, Hip4Candle[]>>({
    fetchFn: () =>
      active ? fetchCandlesForCoins(coins, interval, startTime) : Promise.resolve({}),
    refreshInterval: active ? 30000 : 600000,
    dependencies: [key, active],
    maxRetries: 2,
  });

  return {
    candlesByCoin: data ?? {},
    isLoading,
    error,
    refetch,
  };
}
