import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchTotalFills24h } from "../api";
import type { OverviewStat24h } from "../types";

export function useTotalFills24h(): {
  data: OverviewStat24h | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, error, refetch } = useDataFetching<OverviewStat24h>({
    fetchFn: fetchTotalFills24h,
    dependencies: [],
    refreshInterval: 60_000,
    maxRetries: 3,
  });

  return { data: data ?? null, isLoading, error, refetch };
}
