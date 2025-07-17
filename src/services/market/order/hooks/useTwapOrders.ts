import { useState, useCallback, useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTwapOrders, fetchLatestTwapOrders, fetchUserTwapOrders } from '../api';
import { 
  TwapOrderParams, 
  TwapOrderPaginatedResponse, 
  UseTwapOrdersOptions,
  EnrichedTwapOrder,
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

/**
 * Hook spécialisé pour récupérer les derniers ordres TWAP
 */
export function useLatestTwapOrders(
  limit: number = 50,
  status: "active" | "canceled" | "error" | "completed" | "all" = "all",
  initialData?: EnrichedTwapOrder[]
) {
  const { data, isLoading, error, refetch } = useDataFetching<TwapOrderPaginatedResponse>({
    fetchFn: () => fetchLatestTwapOrders(limit, status),
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
    } : undefined,
    refreshInterval: 30000
  });

  return {
    orders: data?.data || [],
    isLoading,
    error,
    refetch,
    totalVolume: data?.pagination.totalVolume || 0,
    metadata: data?.metadata
  };
}

/**
 * Hook spécialisé pour récupérer les ordres TWAP d'un utilisateur spécifique
 */
export function useUserTwapOrders(
  userAddress: string,
  limit: number = 50,
  initialData?: EnrichedTwapOrder[]
) {
  const { data, isLoading, error, refetch } = useDataFetching<TwapOrderPaginatedResponse>({
    fetchFn: () => fetchUserTwapOrders(userAddress, limit),
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
    } : undefined,
    refreshInterval: 30000,
    dependencies: [userAddress]
  });

  return {
    orders: data?.data || [],
    isLoading,
    error,
    refetch,
    totalVolume: data?.pagination.totalVolume || 0,
    metadata: data?.metadata
  };
} 