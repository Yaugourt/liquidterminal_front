import { useState, useEffect } from 'react';
import { fetchVaults } from '../api';
import { VaultSummary, UseVaultsResult, VaultsParams } from '../types';

interface UseVaultsOptions {
  page?: number;
  limit?: number;
  sortBy?: 'apr' | 'tvl';
}

export function useVaults({
  page = 1,
  limit = 20,
  sortBy = 'tvl'
}: UseVaultsOptions = {}): UseVaultsResult {
  const [vaults, setVaults] = useState<VaultSummary[]>([]);
  const [totalTvl, setTotalTvl] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (params: VaultsParams) => {
    try {
      setIsLoading(true);
      const response = await fetchVaults(params);
      setVaults(response.data);
      setTotalTvl(response.pagination.totalVolume || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch vaults'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ page, limit, sortBy });
  }, [page, limit, sortBy]);

  const updateParams = (newParams: Partial<VaultsParams>) => {
    fetchData({ page, limit, sortBy, ...newParams });
  };

  return {
    vaults,
    totalTvl,
    isLoading,
    error,
    refetch: () => fetchData({ page, limit, sortBy }),
    updateParams
  };
} 