import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchSpotTokens } from '../api';
import { SpotMarketResponse } from '../types';
import strictList from '@/../public/strict.json';

export function useSpotTokens({
  limit = 10,
  page = 1,
  sortBy = 'volume',
  sortOrder = 'desc',
  strict = false,
}: {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  strict?: boolean;
} = {}) {
  const { 
    data: response, 
    isLoading, 
    error,
    refetch
  } = useDataFetching<SpotMarketResponse>({
    fetchFn: async () => {
      if (!strict) {
        // Mode ALL : pagination côté serveur
        const response = await fetchSpotTokens({
          limit,
          page,
          sortBy,
          sortOrder
        });
        return {
          data: response.data,
          total: response.pagination.total,
          page: response.pagination.page,
          limit: response.pagination.limit,
          totalPages: response.pagination.totalPages,
          totalVolume: response.pagination.totalVolume || 0,
          hasNext: response.pagination.page < response.pagination.totalPages,
          hasPrevious: response.pagination.page > 1
        };
      } else {
        // Mode STRICT : tout récupérer, filtrer, paginer localement
        const response = await fetchSpotTokens({
          limit: 1000,
          page: 1,
          sortBy,
          sortOrder
        });
        const filteredData = response.data.filter(token => strictList.includes(token.name.trim()));
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filteredData.slice(start, end);
        return {
          data: paginated,
          total: filteredData.length,
          page,
          limit,
          totalPages: Math.ceil(filteredData.length / limit),
          totalVolume: response.pagination.totalVolume || 0,
          hasNext: page < Math.ceil(filteredData.length / limit),
          hasPrevious: page > 1
        };
      }
    },
    refreshInterval: 10000,
    maxRetries: 3,
    dependencies: [strict, page, limit, sortBy, sortOrder]
  });

  return {
    data: response?.data || [],
    total: response?.total || 0,
    page: response?.page || 1,
    totalPages: response?.totalPages || 0,
    isLoading,
    error,
    refetch,
    totalVolume: response?.totalVolume || 0,
    strict
  };
}

// Hook spécifique pour les tokens tendance (top 5)
export function useTrendingSpotTokens(limit: number = 5, sortBy: string = 'change24h', sortOrder: 'asc' | 'desc' = 'desc') {
  const { data, isLoading, error, refetch, totalVolume } = useSpotTokens({
    limit,
    page: 1,
    sortBy,
    sortOrder,
    strict: false
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    totalVolume
  };
} 