import { usePaginatedData } from '@/hooks/usePaginatedData';
import { fetchSpotTokens } from '../api';
import { SpotToken } from '../types';

interface UseSpotTokensOptions {
  limit?: number;
  defaultParams?: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: any;
  };
}

export function useSpotTokens({
  limit = 10,
  defaultParams = {},
}: UseSpotTokensOptions = {}) {
  const adaptFetchFn = async (params: any) => {
    const response = await fetchSpotTokens(params);
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
      totalVolume: response.pagination.totalVolume
    };
  };

  const { 
    data, 
    total, 
    page, 
    totalPages, 
    isLoading, 
    error,
    updateParams,
    refetch,
    metadata
  } = usePaginatedData<SpotToken>({
    fetchFn: adaptFetchFn,
    defaultParams: {
      limit,
      ...defaultParams,
    }
  });

  return {
    data,
    total,
    page,
    totalPages,
    isLoading,
    error,
    updateParams,
    refetch,
    totalVolume: metadata?.totalVolume
  };
}

// Hook spécifique pour les tokens tendance (top 5)
export function useTrendingSpotTokens(limit: number = 5, sortBy: string = 'volume', sortOrder: 'asc' | 'desc' = 'desc') {
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