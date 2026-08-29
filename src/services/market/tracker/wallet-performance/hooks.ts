import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchWalletPerformance, fetchWalletCoins, fetchWalletOverview } from './api';
import type { WalletPerformance, WalletCoinStat, WalletOverview } from './types';

export const useWalletOverview = (address: string) => {
  const { data, isLoading, error, refetch } = useDataFetching<WalletOverview>({
    fetchFn: () => fetchWalletOverview(address),
    dependencies: [address],
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { overview: data, isLoading, error, refetch };
};

export const useWalletPerformance = (address: string) => {
  const { data, isLoading, error, refetch } = useDataFetching<WalletPerformance>({
    fetchFn: () => fetchWalletPerformance(address),
    dependencies: [address],
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { performance: data, isLoading, error, refetch };
};

export const useWalletCoins = (address: string, limit = 8) => {
  const { data, isLoading, error, refetch } = useDataFetching<WalletCoinStat[]>({
    fetchFn: () => fetchWalletCoins(address, limit),
    dependencies: [address, limit],
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { coins: data ?? [], isLoading, error, refetch };
};
