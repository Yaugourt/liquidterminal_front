import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchTotalFees24h } from "../api";
import type { OverviewFees24h } from "../types";

export function useTotalFees24h(): {
  data: OverviewFees24h | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, error, refetch } = useDataFetching<OverviewFees24h>({
    fetchFn: fetchTotalFees24h,
    dependencies: [],
    refreshInterval: 60_000,
    maxRetries: 3,
  });

  return { data: data ?? null, isLoading, error, refetch };
}
