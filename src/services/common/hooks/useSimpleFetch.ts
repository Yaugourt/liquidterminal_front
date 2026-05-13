import { useDataFetching } from "@/hooks/useDataFetching";
import { REFRESH_INTERVALS } from "@/services/api/constants";

/**
 * Generic hook for parameterless `GET` fetches.
 * Wraps `useDataFetching` and exposes the same surface — use this instead of re-writing
 * `useState(loading) + useEffect(fetch) + retry + refetch` per domain.
 *
 * Example:
 *   const { data, isLoading, error, refetch } = useSimpleFetch({
 *     fetchFn: () => fetchEvmStats(),
 *     refreshInterval: REFRESH_INTERVALS.DEFAULT,
 *   });
 */
export interface UseSimpleFetchOptions<T> {
  fetchFn: (signal?: AbortSignal) => Promise<T>;
  refreshInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
  initialData?: T | null;
}

export function useSimpleFetch<T>({
  fetchFn,
  refreshInterval = REFRESH_INTERVALS.DEFAULT,
  maxRetries,
  retryDelay,
  initialData,
}: UseSimpleFetchOptions<T>) {
  return useDataFetching<T>({
    fetchFn,
    refreshInterval,
    maxRetries,
    retryDelay,
    initialData,
  });
}
