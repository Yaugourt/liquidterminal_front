import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchWalletPerformance, fetchWalletCoins } from './api';
import type { WalletPerformance, WalletCoinStat } from './types';

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
