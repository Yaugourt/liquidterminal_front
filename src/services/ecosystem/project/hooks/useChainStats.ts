import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchChainStats } from '../api';
import { DefiLlamaChainStats, UseChainStatsResult } from '../types';

/**
 * Hyperliquid chain banner figures (TVL, fees 24h, DEX volume 24h, protocols
 * tracked). Lives independently of any single project — used by the projects
 * list page and unlinked project pages.
 */
export const useChainStats = (): UseChainStatsResult => {
  const { data, isLoading, error } = useDataFetching<DefiLlamaChainStats>({
    fetchFn: () => fetchChainStats(),
    refreshInterval: 300000,
    dependencies: [],
    maxRetries: 2,
  });

  return { stats: data ?? undefined, isLoading, error };
};
