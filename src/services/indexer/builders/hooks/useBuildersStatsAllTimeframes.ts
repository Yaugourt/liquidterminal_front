import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchBuildersStatsAllTimeframes } from "../api";
import type { BuildersAllTimeframesPayload, UseBuildersStatsAllTimeframesResult } from "../types";

export function useBuildersStatsAllTimeframes(): UseBuildersStatsAllTimeframesResult {
  const { data, isLoading, error, refetch } = useDataFetching<BuildersAllTimeframesPayload>({
    fetchFn: () => fetchBuildersStatsAllTimeframes(),
    dependencies: [],
    refreshInterval: 60_000,
    maxRetries: 2,
  });

  return {
    stats: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
