import { useDataFetching } from "@/hooks/useDataFetching";
import { REFRESH_INTERVALS } from "@/services/api/constants";
import { getFeeRank } from "../api";
import type { FeeRankData, UseFeeRankResult } from "../types";

/**
 * Hyperliquid's fee rank across the whole DefiLlama field (~2.9k protocols),
 * computed by the backend. The aggregate recomputes on a slow cadence, so a
 * five-minute poll keeps the ordinal fresh.
 */
export function useFeeRank(): UseFeeRankResult {
  const { data, isLoading, isRefreshing, error, refetch, dataUpdatedAt } =
    useDataFetching<FeeRankData | null>({
      fetchFn: getFeeRank,
      refreshInterval: REFRESH_INTERVALS.DAILY,
      maxRetries: 2,
    });

  return { data: data ?? null, isLoading, isRefreshing, error, refetch, dataUpdatedAt };
}
