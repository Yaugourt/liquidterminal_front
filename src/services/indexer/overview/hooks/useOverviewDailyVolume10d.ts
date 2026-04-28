import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchDailyVolume10d } from "../api";
import type { DailyVolumeEntry } from "../types";

export function useOverviewDailyVolume10d(): {
  data: DailyVolumeEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, error, refetch } = useDataFetching<DailyVolumeEntry[]>({
    fetchFn: fetchDailyVolume10d,
    dependencies: [],
    refreshInterval: 300_000,
    maxRetries: 3,
  });

  return { data: data ?? [], isLoading, error, refetch };
}
