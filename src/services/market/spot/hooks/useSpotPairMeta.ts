import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchSpotPairMeta } from '../api';
import { SpotPairMeta } from '../types';

/**
 * Market-index → pair metadata (real quote asset + on-HL circulating supply)
 * from HL `spotMetaAndAssetCtxs`. One fetch, refreshed on the static tier.
 */
export function useSpotPairMeta() {
  const { data, isLoading, error } = useDataFetching<Record<number, SpotPairMeta>>({
    fetchFn: fetchSpotPairMeta,
    refreshInterval: 60000,
    maxRetries: 3,
  });

  return {
    pairMeta: data ?? null,
    isLoading,
    error,
  };
}
