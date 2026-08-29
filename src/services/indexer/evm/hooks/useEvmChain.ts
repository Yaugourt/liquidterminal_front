import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchEvmStats, fetchEvmDailyStats, fetchEvmBlocks } from "../api";
import type {
  EvmStats,
  EvmDailyStat,
  EvmBlock,
  UseEvmStatsResult,
  UseEvmDailyStatsResult,
  UseEvmBlocksResult,
} from "../types";

/** Lifetime HyperEVM chain stats (blocks, txs, logs, tip). */
export function useEvmStats(): UseEvmStatsResult {
  const { data, isLoading, error, refetch } = useDataFetching<EvmStats>({
    fetchFn: () => fetchEvmStats(),
    refreshInterval: 30_000,
    maxRetries: 2,
  });
  return { stats: data, isLoading, error, refetch };
}

/** Daily HyperEVM activity (blocks / transactions / gas per day). */
export function useEvmDailyStats(limit = 31): UseEvmDailyStatsResult {
  const { data, isLoading, error, refetch } = useDataFetching<EvmDailyStat[]>({
    fetchFn: () => fetchEvmDailyStats(limit),
    dependencies: [limit],
    refreshInterval: 60_000,
    maxRetries: 2,
  });
  return { daily: data ?? [], isLoading, error, refetch };
}

/** Most recent HyperEVM blocks. */
export function useEvmBlocks(limit = 20): UseEvmBlocksResult {
  const { data, isLoading, error, refetch } = useDataFetching<EvmBlock[]>({
    fetchFn: () => fetchEvmBlocks(limit),
    dependencies: [limit],
    refreshInterval: 15_000,
    maxRetries: 2,
  });
  return { blocks: data ?? [], isLoading, error, refetch };
}
