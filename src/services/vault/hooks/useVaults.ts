import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchVaults } from '../api';
import { 
  UseVaultsResult, 
  VaultSummary, 
  VaultsParams, 
  UseVaultsOptions 
} from '../types';
import { useState, useCallback } from 'react';
import { PaginatedResponse } from '../../dashboard/types';

/**
 * Hook pour récupérer la liste des vaults avec pagination et tri
 */
export function useVaults({
  page = 1,
  limit = 20,
  sortBy = 'tvl'
}: UseVaultsOptions = {}): UseVaultsResult {
  const [params, setParams] = useState<VaultsParams>({
    page,
    limit,
    sortBy
  });

  const {
    data: response,
    isLoading,
    error,
    refetch
  } = useDataFetching<PaginatedResponse<VaultSummary>>({
    fetchFn: async () => {
      console.log('Fetching vaults with params:', params);
      const response = await fetchVaults(params);
      console.log('Received vaults:', response);
      return response;
    },
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    maxRetries: 3,
    dependencies: [params]
  });

  const updateParams = useCallback((newParams: Partial<VaultsParams>) => {
    console.log('Updating vault params:', newParams);
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    vaults: response?.data || [],
    totalTvl: response?.pagination.totalVolume || 0,
    isLoading,
    error,
    refetch,
    updateParams
  };
} 