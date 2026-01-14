import { useState, useCallback, useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchStakingHolders } from '../staking-holders';
import { 
  HoldersParams, 
  StakedHoldersResponse, 
  UseStakingHoldersOptions,
  UseStakingHoldersPaginatedResult 
} from '../types/holders';

/**
 * Hook pour récupérer la liste paginée des holders de HYPE staké
 */
export function useStakingHoldersPaginated({
  limit = 50,
  defaultParams = {},
  initialData
}: UseStakingHoldersOptions = {}): UseStakingHoldersPaginatedResult {
  const [params, setParams] = useState<HoldersParams>(() => ({
    limit,
    page: defaultParams.page || 1,
    ...defaultParams,
  }));

  const { 
    data: response, 
    isLoading, 
    error,
    refetch
  } = useDataFetching<StakedHoldersResponse>({
    fetchFn: async () => {
      const response = await fetchStakingHolders(params);
      return response;
    },
    refreshInterval: 30000,
    maxRetries: 3,
    dependencies: [params],
    initialData: initialData ? {
      success: true,
      data: {
        holders: initialData,
        pagination: {
          page: 1,
          limit: initialData.length,
          total: initialData.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        },
        metadata: {
          token: 'HYPE',
          lastUpdate: Date.now() / 1000,
          holdersCount: initialData.length
        }
      }
    } : undefined
  });

  const updateParams = useCallback((newParams: Partial<HoldersParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Memoized results pour optimiser les re-renders
  const results = useMemo(() => ({
    holders: response?.data.holders || [],
    total: response?.data.pagination.total || 0,
    page: response?.data.pagination.page || 1,
    totalPages: response?.data.pagination.totalPages || 0,
    metadata: response?.data.metadata,
    isLoading,
    error,
    updateParams,
    refetch
  }), [response, isLoading, error, updateParams, refetch]);

  return results;
} 