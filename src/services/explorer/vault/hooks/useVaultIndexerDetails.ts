import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchIndexerVaultDetails } from '../api';
import { IndexerVaultDetailsData, UseVaultIndexerDetailsResult } from '../types';

/**
 * Hook to fetch vault metadata and portfolio history from the HypeDexer indexer.
 */
export const useVaultIndexerDetails = (params: {
  vaultAddress: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}): UseVaultIndexerDetailsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<IndexerVaultDetailsData>({
    fetchFn: () => fetchIndexerVaultDetails(params),
    dependencies: [params.vaultAddress, params.startTime, params.endTime],
    refreshInterval: 60000,
    maxRetries: 3,
  });

  return {
    details: data,
    isLoading,
    error,
    refetch,
  };
};
