import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchAfBuybacks } from '../api';
import type { AfBuybacks, AfBuybacksPayload, UseAfBuybacksResult } from '../types';

/**
 * useAfBuybacks — the REAL Assistance-Fund buyback rate, straight from the
 * fund's on-chain HYPE buy fills (no proxy), aggregated per UTC day by the
 * backend. The average daily / weekly / monthly buyback is taken over the
 * completed days it read whole: a day Hyperliquid no longer holds whole is
 * left out rather than averaged in as a slump.
 */
export function useAfBuybacks(): UseAfBuybacksResult {
  const { data, isLoading, isRefreshing, error, refetch, dataUpdatedAt } = useDataFetching<AfBuybacksPayload>({
    fetchFn: fetchAfBuybacks,
    refreshInterval: REFRESH_INTERVALS.DAILY, // 5 min — buyback is a slow aggregate
    dependencies: [],
    maxRetries: 2,
  });

  const aggregated = useMemo<AfBuybacks | null>(() => {
    // No completed day yet (the backend reads them after a cold start).
    if (!data || data.days.length === 0) return null;
    const completed = data.days;
    const n = completed.length;
    const sumHype = completed.reduce((a, d) => a + d.hype, 0);
    const sumUsd = completed.reduce((a, d) => a + d.usd, 0);
    const avgDailyHype = sumHype / n;
    const avgDailyUsd = sumUsd / n;
    return {
      // Completed days, then today (partial) last.
      daily: [...completed, data.today],
      recent: data.recent,
      avgDailyHype,
      avgDailyUsd,
      weeklyHype: avgDailyHype * 7,
      weeklyUsd: avgDailyUsd * 7,
      monthlyHype: avgDailyHype * 30,
      monthlyUsd: avgDailyUsd * 30,
      windowDays: n,
      avgPrice: sumHype > 0 ? sumUsd / sumHype : 0,
    };
  }, [data]);

  return { data: aggregated, isLoading, isRefreshing, error, refetch, dataUpdatedAt };
}
