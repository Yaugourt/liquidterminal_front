import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4Markets } from "../api";
import type { Hip4MarketRow, Hip4MarketsQuery, UseHip4MarketsResult } from "../types";

export function useHip4Markets(params?: Hip4MarketsQuery): UseHip4MarketsResult {
  const { data, isLoading, error, refetch } = useDataFetching<Hip4MarketRow[]>({
    fetchFn: () => fetchHip4Markets(params),
    refreshInterval: 30000,
    dependencies: [JSON.stringify(params)],
    maxRetries: 3,
  });

  return {
    markets: Array.isArray(data) ? data : [],
    isLoading,
    error,
    refetch,
  };
}
