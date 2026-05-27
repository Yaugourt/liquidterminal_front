import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4Analytics } from "../api";
import type {
  Hip4AnalyticsBucket,
  Hip4AnalyticsQuery,
  UseHip4AnalyticsResult,
} from "../types";

export function useHip4Analytics(params?: Hip4AnalyticsQuery): UseHip4AnalyticsResult {
  const { data, isLoading, error, dataUpdatedAt, refetch } = useDataFetching<Hip4AnalyticsBucket[]>({
    fetchFn: () => fetchHip4Analytics(params),
    refreshInterval: 60000,
    dependencies: [JSON.stringify(params)],
    maxRetries: 3,
  });

  return {
    buckets: Array.isArray(data) ? data : [],
    isLoading,
    error,
    dataUpdatedAt,
    refetch,
  };
}
