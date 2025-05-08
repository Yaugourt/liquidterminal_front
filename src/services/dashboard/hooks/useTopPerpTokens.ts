import { PerpMarketData } from '../../market/perp/types';
import { UseTopPerpTokensResult } from '../types';
import { useTopPerpMarkets } from '../../market/perp/hooks/usePerpMarket';

export const useTopPerpTokens = (limit: number = 5, sortBy: string = 'volume', sortOrder: 'asc' | 'desc' = 'desc'): UseTopPerpTokensResult => {
  const { data, isLoading, error, refetch, updateParams, totalVolume } = useTopPerpMarkets(limit, sortBy, sortOrder);

  return {
    tokens: data || [],
    isLoading,
    error,
    refetch,
    updateParams,
    totalVolume
  };
}; 