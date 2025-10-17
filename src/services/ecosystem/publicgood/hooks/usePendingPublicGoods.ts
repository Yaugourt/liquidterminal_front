import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPendingPublicGoods } from '../api';
import { PublicGoodsResponse, PublicGoodQueryParams, PublicGood } from '../types';

export interface UsePendingPublicGoodsResult {
  pendingPublicGoods: PublicGood[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const usePendingPublicGoods = (params?: Omit<PublicGoodQueryParams, 'status'>): UsePendingPublicGoodsResult => {
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

  const { data, isLoading, error, refetch } = useDataFetching<PublicGoodsResponse>({
    fetchFn: async () => {
      return await fetchPendingPublicGoods(cleanParams);
    },
    refreshInterval: 30000,
    dependencies: [JSON.stringify(cleanParams)],
    maxRetries: 3
  });

  return {
    pendingPublicGoods: data?.data || [],
    isLoading,
    error,
    refetch,
    pagination: data?.pagination
  };
};

