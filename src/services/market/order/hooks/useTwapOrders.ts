import { useState, useCallback, useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTwapOrders } from '../api';
import {
  TwapOrderParams,
  TwapOrderPaginatedResponse,
  UseTwapOrdersOptions,
  UseTwapOrdersResult
} from '../types';

export function useTwapOrders({
  limit = 50,
  status = "all",
  defaultParams = {},
  initialData
}: UseTwapOrdersOptions = {}): UseTwapOrdersResult {
  const [params, setParams] = useState<TwapOrderParams>(() => ({
    limit,
    status,
    sortBy: defaultParams.sortBy || 'time',
    sortOrder: defaultParams.sortOrder || 'desc',
    page: defaultParams.page || 1,
    ...defaultParams,
  }));

  const { 
    data: response, 
    isLoading, 
    error,
    refetch
  } = useDataFetching<TwapOrderPaginatedResponse>({
    fetchFn: async () => {

      const response = await fetchTwapOrders(params);

      return response;
    },
    refreshInterval: 30000,
    maxRetries: 3,
    dependencies: [params],
    initialData: initialData ? {
      data: initialData,
      pagination: {
        total: initialData.length,
        page: 1,
        limit: initialData.length,
        totalPages: 1,
        totalVolume: initialData.reduce((sum, order) => {
          return sum + order.totalValueUSD;
        }, 0)
      }
    } : undefined
  });

  const updateParams = useCallback((newParams: Partial<TwapOrderParams>) => {

    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Memoized results
  const results = useMemo(() => ({
    orders: response?.data || [],
    total: response?.pagination.total || 0,
    page: response?.pagination.page || 1,
    totalPages: response?.pagination.totalPages || 0,
    totalVolume: response?.pagination.totalVolume || 0,
    metadata: response?.metadata,
    isLoading,
    error,
    updateParams,
    refetch
  }), [response, isLoading, error, updateParams, refetch]);

  return results;
}
