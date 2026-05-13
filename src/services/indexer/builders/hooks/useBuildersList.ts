import { useSimpleFetch } from "@/services/common";
import { REFRESH_INTERVALS } from "@/services/api/constants";
import { fetchBuildersList } from "../api";
import type { BuilderListRow, UseBuildersListResult } from "../types";

export function useBuildersList(): UseBuildersListResult {
  const { data, isLoading, error, refetch } = useSimpleFetch<BuilderListRow[]>({
    fetchFn: () => fetchBuildersList(),
    refreshInterval: REFRESH_INTERVALS.STATIC,
  });

  return {
    builders: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
