import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchMyPublicGoods } from '../api';
import { PublicGoodsResponse, PublicGoodQueryParams, PublicGood } from '../types';

export interface UseMyPublicGoodsResult {
  myPublicGoods: PublicGood[];
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

export const useMyPublicGoods = (params?: Omit<PublicGoodQueryParams, 'status'>): UseMyPublicGoodsResult => {
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
      return await fetchMyPublicGoods(cleanParams);
    },
    refreshInterval: 30000,
    dependencies: [JSON.stringify(cleanParams)],
    maxRetries: 3
  });

  return {
    myPublicGoods: data?.data || [],
    isLoading,
    error,
    refetch,
    pagination: data?.pagination
  };
};

