import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchIndexerVaultSummaries } from '../api';
import { IndexerVaultSummaryItem, UseVaultSummariesResult } from '../types';

/**
 * Hook to fetch all vault summaries from the HypeDexer indexer.
 * Returns one row per vault sorted by follower count.
 */
export const useVaultSummaries = (params?: {
  includeClosed?: boolean;
  limit?: number;
}): UseVaultSummariesResult => {
  const { data, isLoading, error, refetch } = useDataFetching<IndexerVaultSummaryItem[]>({
    fetchFn: () => fetchIndexerVaultSummaries(params),
    dependencies: [params?.includeClosed, params?.limit],
    refreshInterval: 60000,
    maxRetries: 3,
  });

  return {
    summaries: data ?? [],
    isLoading,
    error,
    refetch,
  };
};
