import { SpotToken } from '../../market/spot/types';
import { UseTopTokensResult } from '../types';
import { useTrendingSpotTokens } from '../../market/spot/hooks/useSpotMarket';

export const useTopTokens = (limit: number = 5): UseTopTokensResult => {
  const { data, isLoading, error, refetch } = useTrendingSpotTokens(limit);

  return {
    tokens: data || [],
    isLoading,
    error,
    refetch
  };
}; 