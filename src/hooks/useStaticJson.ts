import { useDataFetching } from './useDataFetching';

interface UseStaticJsonResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads a static JSON file (typically from /public) once on mount.
 * Built on `useDataFetching` with no polling and no retries, mirroring
 * the previous hand-rolled fetch-once behavior.
 *
 * @param path Public path of the JSON file (e.g. '/hyperliquid-info.json')
 * @param errorMessage Error message thrown when the response is not OK
 */
export function useStaticJson<T>(path: string, errorMessage: string): UseStaticJsonResult<T> {
  const { data, isLoading, error } = useDataFetching<T>({
    fetchFn: async (signal) => {
      const response = await fetch(path, { signal });
      if (!response.ok) {
        throw new Error(errorMessage);
      }
      return response.json() as Promise<T>;
    },
    refreshInterval: 0, // static data — fetch once, no polling
    maxRetries: 0, // preserve previous no-retry behavior
    dependencies: [path],
  });

  return {
    data,
    loading: isLoading,
    error: error ? error.message : null,
  };
}
