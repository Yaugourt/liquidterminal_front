import { AuctionInfo, UseLatestAuctionsResult } from '../types';
import { fetchLatestAuctions } from '../api';
import { useDataFetching } from '../../../hooks/useDataFetching';

export const useLatestAuctions = (limit: number = 5): UseLatestAuctionsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<AuctionInfo[]>({
    fetchFn: () => fetchLatestAuctions(limit),
    dependencies: [limit]
  });

  return {
    auctions: data || [],
    isLoading,
    error,
    refetch
  };
}; 