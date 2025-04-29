import { PerpMarketData } from '../../market/perp/types';
import { UseTopPerpTokensResult } from '../types';
import { useTopPerpMarkets } from '../../market/perp/hooks/usePerpMarket';

export const useTopPerpTokens = (limit: number = 5): UseTopPerpTokensResult => {
  const { data, isLoading, error, refetch } = useTopPerpMarkets();

  return {
    tokens: data || [],
    isLoading,
    error,
    refetch
  };
}; 