import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTopLiquidations } from '../api';
import type { Liquidation, TopLiquidationsPeriod, TopLiquidationsResponse } from '../types';

/**
 * Largest liquidations of a window, from the local liquidations DB (no
 * HypeDexer call). The backend keeps each answer 30 s.
 */
export const useTopLiquidations = (
  period: TopLiquidationsPeriod,
  minAmountDollars: number,
  limit: number,
  refreshInterval = 30000
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
