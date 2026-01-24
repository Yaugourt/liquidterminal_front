'use client';

import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPastAuctionsPerp } from '../api';
import { PastAuctionPerp } from '../types';

export interface UsePastAuctionsPerpResult {
  auctions: PastAuctionPerp[];
  isLoading: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching past perp auctions from Hypurrscan
 */
export function usePastAuctionsPerp(): UsePastAuctionsPerpResult {
  const { data, isLoading, isInitialLoading, isRefreshing, error, refetch } = useDataFetching<PastAuctionPerp[]>({
    fetchFn: fetchPastAuctionsPerp,
    refreshInterval: 60000, // 60s - static data
    dependencies: [],
  });

  return {
    auctions: data ?? [],
    isLoading,
    isInitialLoading,
    isRefreshing,
    error,
    refetch
  };
}