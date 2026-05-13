import { useSimpleFetch } from "@/services/common";
import { REFRESH_INTERVALS } from "@/services/api/constants";
import { fetchEvmStats } from "../api";
import type { EvmStats, UseEvmStatsResult } from "../types";

export function useEvmStats(): UseEvmStatsResult {
  const { data, isLoading, error, refetch } = useSimpleFetch<EvmStats>({
    fetchFn: () => fetchEvmStats(),
    refreshInterval: REFRESH_INTERVALS.DEFAULT,
  });

  return { stats: data ?? null, isLoading, error, refetch };
}
