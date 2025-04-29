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
      totalPages: response.pagination.totalPages
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
  } = usePaginatedData<SpotToken>({
    fetchFn: adaptFetchFn,
    defaultParams: {
      limit,
      sortBy: 'volume',
      sortOrder: 'desc',
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
  };
}

// Hook spécifique pour les tokens tendance (top 5)
export function useTrendingSpotTokens(limit: number = 5) {
  return useSpotTokens({
    limit,
    defaultParams: {
      sortBy: 'volume',
      sortOrder: 'desc',
    }
  });
} 