import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchBuildersGlobalStats } from "../api";
import type { BuildersGlobalStatsPayload, BuildersTimeframe, UseBuildersGlobalStatsResult } from "../types";

export function useBuildersGlobalStats(timeframe?: BuildersTimeframe): UseBuildersGlobalStatsResult {
  const { data, isLoading, error, refetch } = useDataFetching<BuildersGlobalStatsPayload>({
    fetchFn: () => fetchBuildersGlobalStats(timeframe),
    dependencies: [timeframe],
    refreshInterval: 30_000,
    maxRetries: 3,
  });

  return {
    stats: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
