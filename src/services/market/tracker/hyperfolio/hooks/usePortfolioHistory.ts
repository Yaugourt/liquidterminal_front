import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchPortfolioHistory } from '../api';
import type { PortfolioHistory } from '../types';

/**
 * Hyperfolio net-worth history (daily snapshots). Only wallets tracked on
 * Hyperfolio have snapshots — consumers must gate on `totalSnapshots > 0`.
 */
export const usePortfolioHistory = (address: string, days = 30) => {
  const { data, isLoading, error, refetch } = useDataFetching<PortfolioHistory | null>({
    fetchFn: () => (address ? fetchPortfolioHistory(address, days) : Promise.resolve(null)),
    dependencies: [address, days],
    refreshInterval: REFRESH_INTERVALS.DAILY,
    maxRetries: 1,
  });
  return {
    history: data && data.totalSnapshots > 0 ? data : null,
    isLoading,
    error,
    refetch,
  };
};
