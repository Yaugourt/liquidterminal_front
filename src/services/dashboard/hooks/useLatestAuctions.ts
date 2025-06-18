import { AuctionInfo, AuctionsResponse } from '../types';
import { fetchLatestAuctions } from '../api';
import { useDataFetching } from '../../../hooks/useDataFetching';

export const useLatestAuctions = (
  limit: number = 5,
  currency: "HYPE" | "USDC",
  initialData?: AuctionInfo[]
) => {
  const { data, isLoading, error, refetch } = useDataFetching<AuctionsResponse>({
    fetchFn: () => fetchLatestAuctions(limit),
    initialData: initialData ? { success: true, data: { usdcAuctions: initialData, hypeAuctions: [], splitTimestamp: 0 } } : undefined,
    refreshInterval: 30000 // 30 seconds
  });

  const auctions = data?.success ? (
    currency === "USDC" ? data.data.usdcAuctions : data.data.hypeAuctions
  ).sort((a, b) => b.time - a.time) : [];

  return {
    auctions: auctions.slice(0, limit),
    isLoading,
    error,
    refetch,
    splitTimestamp: data?.data.splitTimestamp
  };
}; 