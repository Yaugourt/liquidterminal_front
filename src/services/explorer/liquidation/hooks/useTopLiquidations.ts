import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTopLiquidations } from '../api';
import type { Liquidation, TopLiquidationsPeriod, TopLiquidationsResponse } from '../types';

/**
 * Largest liquidations of a window, from the local liquidations DB (no
 * HypeDexer call), polled every 15 s so a new record enters the list soon
 * after it shows in the live feed.
 */
export const useTopLiquidations = (
  period: TopLiquidationsPeriod,
  minAmountDollars: number,
  limit: number,
  refreshInterval = 15_000
) => {
  const { data, isLoading, error } = useDataFetching<TopLiquidationsResponse>({
    fetchFn: () => fetchTopLiquidations(period, minAmountDollars, limit),
    dependencies: [period, minAmountDollars, limit],
    refreshInterval,
    maxRetries: 1,
  });

  const liquidations: Liquidation[] = data?.data ?? [];
  return { liquidations, isLoading, error };
};
