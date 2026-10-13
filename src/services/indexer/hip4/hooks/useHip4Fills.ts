import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4Fills } from "../api";
import type { Hip4FillRow, Hip4FillsQuery, UseHip4FillsResult } from "../types";

export function useHip4Fills(params?: Hip4FillsQuery): UseHip4FillsResult {
  const { data, isLoading, error, isStale, dataUpdatedAt, refetch } = useDataFetching<Hip4FillRow[]>({
    fetchFn: () => fetchHip4Fills(params),
    // Live trade tape: the backend keeps an active market's fills a few seconds.
    refreshInterval: 10000,
    dependencies: [JSON.stringify(params)],
    maxRetries: 3,
  });

  return {
    fills: Array.isArray(data) ? data : [],
    isLoading,
    error,
    isStale,
    dataUpdatedAt,
    refetch,
  };
}
