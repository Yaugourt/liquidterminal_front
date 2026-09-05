import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { HYPE_SPOT_COIN } from '@/services/market/hype';
import { fetchTokenCandles } from '../api';
import { TokenCandle } from '../types';

/** One aligned datapoint: every coin rebased to 100 at its first close. */
export interface RelativePerformancePoint {
  /** Candle open timestamp (epoch millis), shared across all coins. */
  time: number;
  HYPE: number;
  BTC: number;
  ETH: number;
  SOL: number;
}

/** Coins fanned out. HYPE is the spot pair (@107); the rest are HL-native perps. */
const COINS = {
  HYPE: HYPE_SPOT_COIN,
  BTC: 'BTC',
  ETH: 'ETH',
  SOL: 'SOL',
} as const;

type SeriesKey = keyof typeof COINS;
const SERIES_KEYS = Object.keys(COINS) as SeriesKey[];

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 90;

/**
 * Fans out `fetchTokenCandles` over HYPE + BTC/ETH/SOL, rebases each series to
 * 100 at its first close, and joins them on the intersection of candle
 * timestamps. Any timestamp missing from a coin is dropped so every returned
 * point carries all four values — a clean rebased comparison with no gaps.
 */
export const useRelativePerformance = (refreshInterval = 0) => {
  // Freeze the window once so Date.now() churn does not re-key the fetch.
  const { startTime, endTime } = useMemo(() => {
    const now = Date.now();
    return { startTime: now - WINDOW_DAYS * DAY_MS, endTime: now };
  }, []);

  const { data, isLoading, error, refetch, dataUpdatedAt, isRefreshing } =
    useDataFetching<RelativePerformancePoint[]>({
      fetchFn: async () => {
        const results = await Promise.all(
          SERIES_KEYS.map((key) =>
            fetchTokenCandles(COINS[key], '1d', startTime, endTime)
          )
        );

        // Rebase each coin to 100 and index its closes by candle-open time.
        const rebasedByKey = new Map<SeriesKey, Map<number, number>>();
        results.forEach((candles: TokenCandle[], i) => {
          const key = SERIES_KEYS[i];
          const sorted = [...candles].sort((a, b) => a.t - b.t);
          const firstClose = sorted.length > 0 ? parseFloat(sorted[0].c) : NaN;
          const map = new Map<number, number>();
          if (Number.isFinite(firstClose) && firstClose > 0) {
            for (const candle of sorted) {
              const close = parseFloat(candle.c);
              if (Number.isFinite(close)) {
                map.set(candle.t, (close / firstClose) * 100);
              }
            }
          }
          rebasedByKey.set(key, map);
        });

        // Intersection of timestamps: keep only points present in every coin.
        const base = rebasedByKey.get('HYPE') ?? new Map<number, number>();
        const points: RelativePerformancePoint[] = [];
        for (const time of base.keys()) {
          const values = {} as Record<SeriesKey, number>;
          let complete = true;
          for (const key of SERIES_KEYS) {
            const v = rebasedByKey.get(key)?.get(time);
            if (v === undefined) {
              complete = false;
              break;
            }
            values[key] = v;
          }
          if (complete) {
            points.push({ time, ...values } as RelativePerformancePoint);
          }
        }

        return points.sort((a, b) => a.time - b.time);
      },
      refreshInterval,
      dependencies: [startTime, endTime],
      maxRetries: 3,
      retryDelay: 1000,
    });

  return {
    series: data ?? [],
    isLoading,
    error: error?.message ?? null,
    refetch,
    dataUpdatedAt,
    isRefreshing,
  };
};
