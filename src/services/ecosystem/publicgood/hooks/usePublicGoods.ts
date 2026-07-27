import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPublicGoods } from '../api';
import { PublicGoodsResponse, PublicGoodQueryParams, PublicGood } from '../types';

export interface UsePublicGoodsResult {
  publicGoods: PublicGood[];
  isLoading: boolean;
  isRefreshing?: boolean;
  error: Error | null;
  refetch: () => void;
  dataUpdatedAt?: number | null;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const usePublicGoods = (params?: PublicGoodQueryParams): UsePublicGoodsResult => {
  // Clean params - remove undefined/null
  const cleanParams = useMemo(() => {
    if (!params) return {};
    
    const cleaned: Record<string, string | number> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }, [params]);

  const { data, isLoading, isRefreshing, error, refetch, dataUpdatedAt } = useDataFetching<PublicGoodsResponse>({
    fetchFn: async () => {
      return await fetchPublicGoods(cleanParams);
    },
    refreshInterval: 30000, // 30 seconds
    dependencies: [JSON.stringify(cleanParams)],
    maxRetries: 3
  });

  return {
    publicGoods: data?.data || [],
    isLoading,
    isRefreshing,
    error,
    refetch,
    dataUpdatedAt,
    pagination: data?.pagination
  };
};

