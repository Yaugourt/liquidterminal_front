import { useState, useCallback, useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchAuctions, fetchLatestAuctions } from '../api';
import { 
  AuctionParams, 
  AuctionPaginatedResponse, 
  UseAuctionsOptions,
  AuctionInfo
} from '../types';

export function useAuctions({
  limit = 1000,
  currency = "ALL",
  defaultParams = {},
  initialData
}: UseAuctionsOptions = {}) {
  const [params, setParams] = useState<AuctionParams>(() => ({
    limit,
    currency,
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
  } = useDataFetching<AuctionPaginatedResponse>({
    fetchFn: async () => {

      const response = await fetchAuctions(params);

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
        totalVolume: initialData.reduce((sum, auction) => sum + parseFloat(auction.deployGas || '0'), 0)
      }
    } : undefined
  });

  const updateParams = useCallback((newParams: Partial<AuctionParams>) => {

    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Memoized results
  const results = useMemo(() => ({
    auctions: response?.data || [],
    total: response?.pagination.total || 0,
    page: response?.pagination.page || 1,
    totalPages: response?.pagination.totalPages || 0,
    totalVolume: response?.pagination.totalVolume || 0,
    splitTimestamp: response?.metadata?.splitTimestamp,
    lastUpdate: response?.metadata?.lastUpdate,
    isLoading,
    error,
    updateParams,
    refetch
  }), [response, isLoading, error, updateParams, refetch]);

  return results;
}

/**
 * Hook spécialisé pour récupérer les dernières auctions
 */
export function useLatestAuctions(
  limit: number = 1000,
  currency: "HYPE" | "USDC" | "ALL" = "ALL",
  initialData?: AuctionInfo[]
) {
  const { data, isLoading, error, refetch } = useDataFetching<AuctionPaginatedResponse>({
    fetchFn: () => fetchLatestAuctions(limit, currency),
    initialData: initialData ? {
      data: initialData,
      pagination: {
        total: initialData.length,
        page: 1,
        limit: initialData.length,
        totalPages: 1,
        totalVolume: initialData.reduce((sum, auction) => sum + parseFloat(auction.deployGas || '0'), 0)
      }
    } : undefined,
    refreshInterval: 30000
  });

  return {
    auctions: data?.data || [],
    isLoading,
    error,
    refetch,
    splitTimestamp: data?.metadata?.splitTimestamp,
    totalVolume: data?.pagination.totalVolume || 0
  };
} 