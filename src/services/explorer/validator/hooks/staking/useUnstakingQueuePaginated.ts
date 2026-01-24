import { UnstakingQueueParams, UnstakingQueuePaginatedResponse, UseUnstakingQueueOptions, UseUnstakingQueuePaginatedResult } from '../../types/staking';
import { fetchUnstakingQueuePaginated } from '../../staking';
import { useDataFetching } from '@/hooks/useDataFetching';
import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Hook pour récupérer la queue d'unstaking avec pagination
 */
export const useUnstakingQueuePaginated = ({
  limit = 25,
  defaultParams = {},
  initialData
}: UseUnstakingQueueOptions = {}): UseUnstakingQueuePaginatedResult => {
  const [params, setParams] = useState<UnstakingQueueParams>(() => ({
    limit,
    page: defaultParams.page || 1,
    ...defaultParams,
  }));

  // Update params when defaultParams change
  useEffect(() => {
    if (defaultParams.page !== undefined || defaultParams.limit !== undefined) {
      setParams(prev => ({
        ...prev,
        page: defaultParams.page || prev.page,
        limit: defaultParams.limit || limit
      }));
    }
  }, [defaultParams.page, defaultParams.limit, limit]);

  const { 
    data: response, 
    isLoading, 
    error,
    refetch
  } = useDataFetching<UnstakingQueuePaginatedResponse>({
    fetchFn: async () => {
  
      const response = await fetchUnstakingQueuePaginated(params);
      return response;
    },
    refreshInterval: 10000, // 10 seconds as mentioned in the docs
    maxRetries: 3,
    dependencies: [params.page, params.limit], // Utiliser les valeurs primitives
    initialData: initialData ? {
      data: initialData,
      pagination: {
        total: initialData.length,
        page: 1,
        limit: initialData.length,
        totalPages: 1,
        totalVolume: initialData.reduce((sum, item) => sum + item.amount, 0),
        hasNext: false,
        hasPrevious: false,
      }
    } : undefined
  });

  const updateParams = useCallback((newParams: Partial<UnstakingQueueParams>) => {

    setParams(prev => {
      const updated = { ...prev, ...newParams };
  
      return updated;
    });
  }, []);

  // Memoized results
  const results = useMemo(() => ({
    unstakingQueue: response?.data || [],
    total: response?.pagination.total || 0,
    page: response?.pagination.page || 1,
    totalPages: response?.pagination.totalPages || 0,
    totalVolume: response?.pagination.totalVolume || 0,
    hasNextPage: response?.pagination.hasNext || false,
    hasPreviousPage: response?.pagination.hasPrevious || false,
    isLoading,
    error,
    updateParams,
    refetch
  }), [response, isLoading, error, updateParams, refetch]);

  return results;
}; 