import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4OutcomeTokens } from "../api";
import type { Hip4OutcomeTokenRow, Hip4OutcomeTokensQuery, UseHip4OutcomeTokensResult } from "../types";

export function useHip4OutcomeTokens(params?: Hip4OutcomeTokensQuery): UseHip4OutcomeTokensResult {
  const { data, isLoading, error, refetch } = useDataFetching<Hip4OutcomeTokenRow[]>({
    fetchFn: () => fetchHip4OutcomeTokens(params),
    refreshInterval: 60000,
    dependencies: [JSON.stringify(params)],
    maxRetries: 3,
  });

  return {
    tokens: Array.isArray(data) ? data : [],
    isLoading,
    error,
    refetch,
  };
}
