import { SpotToken } from '../../market/spot/types';
import { UseTopTokensResult } from '../types';
import { useTrendingSpotTokens } from '../../market/spot/hooks/useSpotMarket';

export const useTopTokens = (limit: number = 5, sortBy: string = 'volume', sortOrder: 'asc' | 'desc' = 'desc'): UseTopTokensResult => {
  const { data, isLoading, error, refetch, updateParams, totalVolume } = useTrendingSpotTokens(limit, sortBy, sortOrder);

  return {
    tokens: data || [],
    isLoading,
    error,
    refetch,
    updateParams,
    totalVolume
  };
}; 