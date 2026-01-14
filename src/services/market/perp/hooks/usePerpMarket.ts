import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPerpMarkets } from '../api';
import { 
   
  PerpMarketParams,
  UsePerpMarketsOptions,
  PerpMarketResponse,
  PerpSortableFields
} from '../types';
import { useState, useCallback } from 'react';

export function usePerpMarkets({
  limit = 10,
  defaultParams = {},
}: UsePerpMarketsOptions = {}) {
  const [params, setParams] = useState<PerpMarketParams>(() => ({
    limit,
    sortBy: defaultParams.sortBy || 'volume',
    sortOrder: defaultParams.sortOrder || 'desc',
    ...defaultParams,
  }));

  const { 
    data: response, 
    isLoading, 
    error,
    refetch
  } = useDataFetching<PerpMarketResponse>({
    fetchFn: async () => {

      const response = await fetchPerpMarkets(params);

      return {
        data: response.data,
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.totalPages,
        totalVolume: response.pagination.totalVolume || 0,
        hasNext: response.pagination.page < response.pagination.totalPages,
        hasPrevious: response.pagination.page > 1
      };
    },
    refreshInterval: 10000,
    maxRetries: 3,
    dependencies: [params]
  });

  const updateParams = useCallback((newParams: Partial<PerpMarketParams>) => {

    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    data: response?.data || [],
    total: response?.total || 0,
    page: response?.page || 1,
    totalPages: response?.totalPages || 0,
    isLoading,
    error,
    updateParams,
    refetch,
    totalVolume: response?.totalVolume || 0
  };
}

// Hook spécifique pour les tokens tendance (top 5)
export function useTrendingPerpMarkets(limit: number = 5, sortBy: PerpSortableFields = 'change24h', sortOrder: 'asc' | 'desc' = 'desc') {
  const { data, isLoading, error, refetch, updateParams, totalVolume } = usePerpMarkets({
    limit,
    defaultParams: {
      sortBy,
      sortOrder,
    }
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    updateParams,
    totalVolume
  };
} 