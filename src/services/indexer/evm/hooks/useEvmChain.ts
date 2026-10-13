import { useDataFetching } from "@/hooks/useDataFetching";
import { REFRESH_INTERVALS } from "@/services/api/constants";
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
  const { data, isLoading, error, isStale, refetch } = useDataFetching<EvmStats>({
    fetchFn: () => fetchEvmStats(),
    refreshInterval: 15_000,
    maxRetries: 2,
  });
  return { stats: data, isLoading, error, isStale, refetch };
}

/** Daily HyperEVM activity (blocks / transactions / gas per day). */
export function useEvmDailyStats(limit = 31): UseEvmDailyStatsResult {
  const { data, isLoading, error, isStale, refetch } = useDataFetching<EvmDailyStat[]>({
    fetchFn: () => fetchEvmDailyStats(limit),
    dependencies: [limit],
    refreshInterval: 60_000,
    maxRetries: 2,
  });
  return { daily: data ?? [], isLoading, error, isStale, refetch };
}

/** Most recent HyperEVM blocks. */
export function useEvmBlocks(limit = 20): UseEvmBlocksResult {
  const { data, isLoading, error, isStale, refetch } = useDataFetching<EvmBlock[]>({
    fetchFn: () => fetchEvmBlocks(limit),
    dependencies: [limit],
    // A block every ~1-2s: poll at the real-time cadence.
    refreshInterval: REFRESH_INTERVALS.REALTIME,
    maxRetries: 2,
  });
  return { blocks: data ?? [], isLoading, error, isStale, refetch };
}
