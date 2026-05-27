import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4Fills } from "../api";
import type { Hip4FillRow, Hip4FillsQuery, UseHip4FillsResult } from "../types";

export function useHip4Fills(params?: Hip4FillsQuery): UseHip4FillsResult {
  const { data, isLoading, error, dataUpdatedAt, refetch } = useDataFetching<Hip4FillRow[]>({
    fetchFn: () => fetchHip4Fills(params),
    refreshInterval: 15000,
    dependencies: [JSON.stringify(params)],
    maxRetries: 3,
  });

  return {
    fills: Array.isArray(data) ? data : [],
    isLoading,
    error,
    dataUpdatedAt,
    refetch,
  };
}
