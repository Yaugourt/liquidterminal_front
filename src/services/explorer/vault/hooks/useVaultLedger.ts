import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchVaultLedger } from '../api';
import { VaultLedgerEntry, UseVaultLedgerResult } from '../types';

/**
 * Hook to fetch deposit/withdrawal ledger entries for a vault.
 * Data is sorted newest-first.
 */
export const useVaultLedger = (params: {
  vaultAddress: string;
  user?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}): UseVaultLedgerResult => {
  const { data, isLoading, error, refetch } = useDataFetching<VaultLedgerEntry[]>({
    fetchFn: () => fetchVaultLedger(params),
    dependencies: [
      params.vaultAddress,
      params.user,
      params.startTime,
      params.endTime,
      params.limit,
    ],
    refreshInterval: 30000,
    maxRetries: 3,
  });

  return {
    entries: data ?? [],
    isLoading,
    error,
    refetch,
  };
};
