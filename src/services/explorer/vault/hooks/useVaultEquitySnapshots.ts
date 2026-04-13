import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchVaultEquitySnapshots } from '../api';
import { VaultEquitySnapshot, UseVaultEquitySnapshotsResult } from '../types';

/**
 * Hook to fetch ~hourly equity snapshots for a specific vault.
 * Data is sorted newest-first; index 0 is the most recent snapshot.
 */
export const useVaultEquitySnapshots = (params: {
  vaultAddress: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}): UseVaultEquitySnapshotsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<VaultEquitySnapshot[]>({
    fetchFn: () => fetchVaultEquitySnapshots(params),
    dependencies: [params.vaultAddress, params.startTime, params.endTime, params.limit],
    refreshInterval: 60000,
    maxRetries: 3,
  });

  return {
    snapshots: data ?? [],
    isLoading,
    error,
    refetch,
  };
};
