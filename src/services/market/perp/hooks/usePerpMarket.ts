import { usePaginatedData } from '@/hooks/usePaginatedData';
import { fetchPerpMarkets } from '../api';
import { PerpMarketData } from '../types';

interface UsePerpMarketsOptions {
  limit?: number;
  defaultParams?: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: any;
  };
}

export function usePerpMarkets({
  limit = 10,
  defaultParams = {},
}: UsePerpMarketsOptions = {}) {
  const adaptFetchFn = async (params: any) => {
    const response = await fetchPerpMarkets(params);
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
  } = usePaginatedData<PerpMarketData>({
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
export function useTopPerpMarkets(limit: number = 5, sortBy: string = 'volume', sortOrder: 'asc' | 'desc' = 'desc') {
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