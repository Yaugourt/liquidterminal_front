import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchBuildersStatsAllTimeframes } from "../api";
import type { BuildersAllTimeframesPayload, UseBuildersStatsAllTimeframesResult } from "../types";

export function useBuildersStatsAllTimeframes(): UseBuildersStatsAllTimeframesResult {
  const { data, isLoading, isRefreshing, dataUpdatedAt, error, isStale, refetch } = useDataFetching<BuildersAllTimeframesPayload>({
    fetchFn: () => fetchBuildersStatsAllTimeframes(),
    dependencies: [],
    // The backend key lives 55s and refreshes in the background, so its copy
    // can be up to a few minutes old: polling faster than 60s gains nothing.
    refreshInterval: 60_000,
    maxRetries: 2,
  });

  return {
    stats: data ?? null,
    isLoading,
    isRefreshing,
    dataUpdatedAt,
    error,
    isStale,
    refetch,
  };
}
