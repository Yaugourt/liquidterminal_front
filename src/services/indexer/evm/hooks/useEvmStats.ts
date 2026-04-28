import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchEvmStats } from "../api";
import type { EvmStats, UseEvmStatsResult } from "../types";

export function useEvmStats(): UseEvmStatsResult {
  const { data, isLoading, error, refetch } = useDataFetching<EvmStats>({
    fetchFn: fetchEvmStats,
    dependencies: [],
    refreshInterval: 30_000,
    maxRetries: 3,
  });

  return { stats: data ?? null, isLoading, error, refetch };
}
