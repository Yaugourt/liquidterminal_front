import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchBuildersGlobalStats } from "../api";
import type { BuildersGlobalStatsPayload, BuildersTimeframe, UseBuildersGlobalStatsResult } from "../types";

export function useBuildersGlobalStats(timeframe?: BuildersTimeframe): UseBuildersGlobalStatsResult {
  const { data, isLoading, error, isStale, refetch } = useDataFetching<BuildersGlobalStatsPayload>({
    fetchFn: () => fetchBuildersGlobalStats(timeframe),
    dependencies: [timeframe],
    refreshInterval: 15_000,
    maxRetries: 3,
  });

  return {
    stats: data ?? null,
    isLoading,
    error,
    isStale,
    refetch,
  };
}
