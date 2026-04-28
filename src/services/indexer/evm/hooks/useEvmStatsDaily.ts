import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchEvmStatsDaily } from "../api";
import type { EvmDailyStatEntry } from "../types";

export function useEvmStatsDaily(days?: number): {
  data: EvmDailyStatEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, error, refetch } = useDataFetching<EvmDailyStatEntry[]>({
    fetchFn: () => fetchEvmStatsDaily(days),
    dependencies: [days],
    refreshInterval: 300_000,
    maxRetries: 3,
  });

  return { data: data ?? [], isLoading, error, refetch };
}
