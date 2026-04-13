import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchVaultDailySnapshots } from '../api';
import { VaultDailySnapshot, UseVaultDailySnapshotsResult } from '../types';

/**
 * Hook to fetch daily account-value snapshots for a specific vault.
 * Data is sorted newest-first; index 0 is the most recent snapshot.
 */
export const useVaultDailySnapshots = (params: {
  vaultAddress: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}): UseVaultDailySnapshotsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<VaultDailySnapshot[]>({
    fetchFn: () => fetchVaultDailySnapshots(params),
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
