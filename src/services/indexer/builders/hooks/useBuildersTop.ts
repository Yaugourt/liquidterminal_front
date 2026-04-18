import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchBuildersTop } from "../api";
import type { BuildersTimeframe, BuildersTopPayload, UseBuildersTopResult } from "../types";

export function useBuildersTop(params?: {
  timeframe?: BuildersTimeframe;
  sort?: string;
  limit?: number;
}): UseBuildersTopResult {
  const { timeframe, sort, limit } = params ?? {};
  const { data, isLoading, error, refetch } = useDataFetching<BuildersTopPayload>({
    fetchFn: () => fetchBuildersTop({ timeframe, sort, limit }),
    dependencies: [timeframe, sort, limit],
    refreshInterval: 30_000,
    maxRetries: 3,
  });

  return {
    data: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
