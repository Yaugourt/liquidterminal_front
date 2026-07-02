import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchAfFills } from '../api';
import type { AfFill, DailyBuyback, AfBuybacks, UseAfBuybacksResult } from '../types';

const DAY_MS = 86_400_000;
/** Trailing window of UTC days pulled per render (one info request each). */
const WINDOW_DAYS = 14;

interface RawBuybacks {
  daily: DailyBuyback[];
  recent: AfFill[];
}

/**
 * useAfBuybacks — the REAL Assistance-Fund buyback rate, straight from the
 * fund's on-chain HYPE buy fills (no proxy). Pulls the last {@link WINDOW_DAYS}
 * UTC days as one request each, aggregates per day, and derives the average
 * daily / weekly / monthly buyback from the completed days.
 */
export function useAfBuybacks(): UseAfBuybacksResult {
  const { data, isLoading, error, refetch } = useDataFetching<RawBuybacks>({
    fetchFn: async () => {
      const now = Date.now();
      const todayStart = Math.floor(now / DAY_MS) * DAY_MS;

      const windows = Array.from({ length: WINDOW_DAYS }, (_, k) => {
        const i = WINDOW_DAYS - 1 - k; // oldest → newest
        const start = todayStart - i * DAY_MS;
        const end = i === 0 ? now : start + DAY_MS;
        return { start, end };
      });

      const results = await Promise.all(windows.map((w) => fetchAfFills(w.start, w.end)));

      const daily: DailyBuyback[] = results.map((fills, idx) => ({
        time: windows[idx].start,
        hype: fills.reduce((a, f) => a + f.sz, 0),
        usd: fills.reduce((a, f) => a + f.sz * f.px, 0),
      }));

      const recent = [...(results[results.length - 1] ?? [])]
        .sort((a, b) => b.time - a.time)
        .slice(0, 12);

      return { daily, recent };
    },
    refreshInterval: REFRESH_INTERVALS.DAILY, // 5 min — buyback is a slow aggregate
    dependencies: [],
    maxRetries: 2,
  });

  const aggregated = useMemo<AfBuybacks | null>(() => {
    if (!data) return null;
    // Exclude the last entry (today, partial) from the average.
    const completed = data.daily.length > 1 ? data.daily.slice(0, -1) : data.daily;
    const n = completed.length || 1;
    const sumHype = completed.reduce((a, d) => a + d.hype, 0);
    const sumUsd = completed.reduce((a, d) => a + d.usd, 0);
    const avgDailyHype = sumHype / n;
    const avgDailyUsd = sumUsd / n;
    return {
      daily: data.daily,
      recent: data.recent,
      avgDailyHype,
      avgDailyUsd,
      weeklyHype: avgDailyHype * 7,
      weeklyUsd: avgDailyUsd * 7,
      monthlyHype: avgDailyHype * 30,
      monthlyUsd: avgDailyUsd * 30,
      windowDays: completed.length,
      avgPrice: sumHype > 0 ? sumUsd / sumHype : 0,
    };
  }, [data]);

  return { data: aggregated, isLoading, error, refetch };
}
