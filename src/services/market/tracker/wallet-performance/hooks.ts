import { useDataFetching } from '@/hooks/useDataFetching';
import {
  fetchWalletPerformance,
  fetchWalletCoins,
  fetchWalletCoinDistribution,
  fetchWalletOverview,
  fetchWalletRoundTrips,
  fetchWalletFundingSummary,
} from './api';
import type {
  WalletPerformance,
  WalletCoinStat,
  WalletCoinShare,
  WalletOverview,
  WalletRoundTrip,
  WalletFundingSummary,
} from './types';

export const useWalletFundingSummary = (address: string) => {
  const { data, isLoading, error, refetch } = useDataFetching<WalletFundingSummary>({
    fetchFn: () => fetchWalletFundingSummary(address),
    dependencies: [address],
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { funding: data, isLoading, error, refetch };
};

export const useWalletRoundTrips = (address: string, limit = 50) => {
  const { data, isLoading, error, refetch } = useDataFetching<WalletRoundTrip[]>({
    fetchFn: () => fetchWalletRoundTrips(address, limit),
    dependencies: [address, limit],
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { trades: data ?? [], isLoading, error, refetch };
};

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

export const useWalletCoinDistribution = (address: string, limit = 100) => {
  const { data, isLoading, error, refetch } = useDataFetching<WalletCoinShare[]>({
    fetchFn: () => fetchWalletCoinDistribution(address, limit),
    dependencies: [address, limit],
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { shares: data ?? [], isLoading, error, refetch };
};
