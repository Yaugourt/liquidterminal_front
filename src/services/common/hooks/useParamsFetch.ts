import { useMemo } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { REFRESH_INTERVALS } from "@/services/api/constants";
import { cleanParams, stableKey } from "@/services/common/utils";

/**
 * Generic hook for `GET` fetches that take a params object.
 * Strips undefined/null/"" entries and uses a deterministic key for the dependency array
 * (so re-renders with structurally equal params do not refetch).
 *
 * Example:
 *   const { data, isLoading, error, refetch } = useParamsFetch({
 *     fetchFn: (params) => fetchProjects(params),
 *     params: { category, status },
 *     refreshInterval: REFRESH_INTERVALS.STATIC,
 *   });
 */
export interface UseParamsFetchOptions<T, P extends Record<string, unknown>> {
  fetchFn: (params: Partial<P>, signal?: AbortSignal) => Promise<T>;
  params?: P;
  refreshInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
  initialData?: T | null;
}

export function useParamsFetch<T, P extends Record<string, unknown>>({
  fetchFn,
  params,
  refreshInterval = REFRESH_INTERVALS.DEFAULT,
  maxRetries,
  retryDelay,
  initialData,
}: UseParamsFetchOptions<T, P>) {
  const cleaned = useMemo(
    () => (params ? cleanParams(params) : ({} as Partial<P>)),
    [params]
  );
  const depKey = useMemo(() => stableKey(cleaned), [cleaned]);

  return useDataFetching<T>({
    fetchFn: (signal) => fetchFn(cleaned, signal),
    refreshInterval,
    dependencies: [depKey],
    maxRetries,
    retryDelay,
    initialData,
  });
}
