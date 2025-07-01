import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchSpotTokens } from '../api';
import {  
  UseSpotTokensOptions, 
  SpotMarketResponse,
  SpotMarketParams
} from '../types';
import { useState, useCallback } from 'react';

export function useSpotTokens({
  limit = 10,
  defaultParams = {},
}: UseSpotTokensOptions = {}) {
  const [params, setParams] = useState<SpotMarketParams>({ 
    limit, 
    ...defaultParams,
    sortBy: defaultParams.sortBy || 'volume',
    sortOrder: defaultParams.sortOrder || 'desc'
  });

  const { 
    data: response, 
    isLoading, 
    error,
    refetch
  } = useDataFetching<SpotMarketResponse>({
    fetchFn: async () => {

      const response = await fetchSpotTokens(params);

      return {
        data: response.data,
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.totalPages,
        totalVolume: response.pagination.totalVolume
      };
    },
    refreshInterval: 10000,
    maxRetries: 3,
    dependencies: [params]
  });

  const updateParams = useCallback((newParams: Partial<SpotMarketParams>) => {

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
export function useTrendingSpotTokens(limit: number = 5, sortBy: string = 'change24h', sortOrder: 'asc' | 'desc' = 'desc') {
  const { data, isLoading, error, refetch, updateParams, totalVolume } = useSpotTokens({
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