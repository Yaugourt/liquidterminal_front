import { useSimpleFetch } from "@/services/common";
import { fetchBuildersList } from "../api";
import type { BuilderListRow, UseBuildersListResult } from "../types";

export function useBuildersList(): UseBuildersListResult {
  const { data, isLoading, error, isStale, refetch } = useSimpleFetch<BuilderListRow[]>({
    fetchFn: () => fetchBuildersList(),
    // The backend refreshes the list every 60s (builder activity is shown as
    // live): polling at 30s keeps the worst-case age near 90s, not 120s.
    refreshInterval: 30_000,
  });

  return {
    builders: data ?? [],
    isLoading,
    error,
    isStale,
    refetch,
  };
}
