import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchVaults } from '../api';
import { 
  UseVaultsResult, 
  VaultSummary, 
  UseVaultsOptions,
  VaultsResponse
} from '../types';
import { useState, useCallback } from 'react';


/**
 * Hook pour récupérer la liste des vaults avec pagination et tri
 */
export const useVaults = ({
  page = 1,
  limit = 1000,
  sortBy = 'tvl',
  initialData
}: UseVaultsOptions & { initialData?: VaultSummary[] } = {}): UseVaultsResult => {
  const [params, setParams] = useState({ page, limit, sortBy });

  const { data, isLoading, error, refetch } = useDataFetching<VaultsResponse>({
    fetchFn: () => fetchVaults(params),
    dependencies: [params],
    initialData: initialData ? {
      success: true,
      data: initialData,
      pagination: {
        totalTvl: 0, // Will be updated on first fetch
        total: initialData.length,
        page: 1
      }
    } : null,
    refreshInterval: 30000 // 30 seconds
  });

  const updateParams = useCallback((newParams: Partial<UseVaultsOptions>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Transform APR from ratio to percentage
  const transformedVaults = data?.data?.map(vault => ({
    ...vault,
    apr: vault.apr * 100 // Convert ratio to percentage
  })) || [];

  return {
    vaults: transformedVaults,
    totalTvl: data?.pagination?.totalTvl || 0,
    totalCount: data?.pagination?.total || 0,
    isLoading,
    error,
    refetch,
    updateParams
  };
}; 