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
  } = usePaginatedData<PerpMarketData>({
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

// Hook spécifique pour les marchés perp tendance (top 5)
export function useTopPerpMarkets() {
  const adaptFetchFn = async (params: any) => {
    const response = await fetchPerpMarkets(params);
    return {
      data: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages
    };
  };

  return usePaginatedData<PerpMarketData>({
    fetchFn: adaptFetchFn,
    defaultParams: {
      limit: 5,
      sortBy: 'volume',
      sortOrder: 'desc',
    }
  });
} 