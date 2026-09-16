import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchWalletPoints } from '../api';
import type { ProtocolPoints } from '../types';

/** Farming points per protocol. Static-ish; no polling. */
export const useWalletPoints = (address: string) => {
  const { data, isLoading, isRefreshing, error, dataUpdatedAt, refetch } = useDataFetching<ProtocolPoints[]>({
    fetchFn: () => (address ? fetchWalletPoints(address) : Promise.resolve([])),
    dependencies: [address],
    refreshInterval: REFRESH_INTERVALS.DISABLED,
    maxRetries: 1,
  });
  return { points: data ?? [], isLoading, isRefreshing, error, dataUpdatedAt, refetch };
};
