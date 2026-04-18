import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchBuildersList } from "../api";
import type { BuilderListRow, UseBuildersListResult } from "../types";

export function useBuildersList(): UseBuildersListResult {
  const { data, isLoading, error, refetch } = useDataFetching<BuilderListRow[]>({
    fetchFn: () => fetchBuildersList(),
    dependencies: [],
    refreshInterval: 60_000,
    maxRetries: 3,
  });

  return {
    builders: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
