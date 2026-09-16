import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchEvmComposition } from '../api';
import type { EvmComposition, UseEvmCompositionResult } from '../types';

/**
 * HyperEVM token balances for a wallet. Polls at the STATIC tier (60 s) — the
 * backend caches upstream answers for as long, so this costs one Hyperfolio
 * call per minute per wallet at most.
 */
export const useEvmComposition = (address: string): UseEvmCompositionResult => {
  const { data, isLoading, isRefreshing, error, dataUpdatedAt, refetch } = useDataFetching<EvmComposition | null>({
    fetchFn: () => (address ? fetchEvmComposition(address) : Promise.resolve(null)),
    dependencies: [address],
    refreshInterval: REFRESH_INTERVALS.STATIC,
    maxRetries: 1,
  });
  return { composition: data, isLoading, isRefreshing, error, dataUpdatedAt, refetch };
};
