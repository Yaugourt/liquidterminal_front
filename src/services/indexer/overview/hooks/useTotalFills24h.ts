import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchTotalFills24h } from "../api";
import type { OverviewStat24h } from "../types";

export function useTotalFills24h(): {
  data: OverviewStat24h | null;
  isLoading: boolean;
  /** True during a background/manual refresh — drives freshness indicators. */
  isRefreshing: boolean;
  error: Error | null;
  /** Epoch ms of the most recent successful fetch — null until first success. */
  dataUpdatedAt: number | null;
  refetch: () => void;
} {
  const { data, isLoading, isRefreshing, error, dataUpdatedAt, refetch } =
    useDataFetching<OverviewStat24h>({
      fetchFn: fetchTotalFills24h,
      dependencies: [],
      refreshInterval: 60_000,
      maxRetries: 3,
    });

  return { data: data ?? null, isLoading, isRefreshing, error, dataUpdatedAt, refetch };
}
