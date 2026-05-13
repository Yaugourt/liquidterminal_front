import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getErrorMessage } from '@/services/common/utils';

interface UseDataFetchingOptions<T> {
  /**
   * Fetch function. Accepts an optional `AbortSignal` — if supplied by the consumer,
   * the hook will pass a signal that fires when the hook re-fetches or unmounts.
   * Existing callers that ignore the param remain compatible.
   */
  fetchFn: (signal?: AbortSignal) => Promise<T>;
  refreshInterval?: number;
  dependencies?: unknown[];
  maxRetries?: number;
  retryDelay?: number;
  initialData?: T | null;
}

export function useDataFetching<T>({
  fetchFn,
  refreshInterval = 30000,
  dependencies = [],
  maxRetries = 3,
  retryDelay = 1000,
  initialData = null
}: UseDataFetchingOptions<T>) {
  // States
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // NEW: Only true for first load
  const [isRefreshing, setIsRefreshing] = useState(false); // NEW: True during background refresh
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Only keep necessary refs
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const hasInitialDataRef = useRef(false); // NEW: Track if we've loaded data before
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup effect
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Main fetch function with retry logic
  const fetchData = useCallback(async (isRetry = false, isPolling = false) => {
    if (!mountedRef.current) return;

    // Abort the previous in-flight request before starting a new one.
    if (!isRetry) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
    }
    const signal = abortControllerRef.current?.signal;

    try {
      if (!isRetry) {
        if (hasInitialDataRef.current && isPolling) {
          // Background refresh - don't show full loading
          setIsRefreshing(true);
        } else {
          // Initial load or manual refetch
          setIsLoading(true);
          setIsInitialLoading(true);
        }
        setError(null);
        setRetryCount(0);
      }

      const result = await fetchFn(signal);

      if (mountedRef.current && !signal?.aborted) {
        setData(result);
        setError(null);
        setRetryCount(0);
        hasInitialDataRef.current = true; // Mark that we have data now
      }
    } catch (err) {
      if (!mountedRef.current || signal?.aborted) return;

      const error = new Error(getErrorMessage(err));

      if (retryCount < maxRetries) {
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        const retryDelayWithBackoff = retryDelay * Math.pow(2, nextRetryCount - 1);

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            fetchData(true, isPolling);
          }
        }, retryDelayWithBackoff);

        setError(new Error(`Retry attempt ${nextRetryCount} of ${maxRetries}: ${error.message}`));
      } else {
        setError(error);
        setRetryCount(0);
      }
    } finally {
      if (mountedRef.current && !isRetry && !signal?.aborted) {
        setIsLoading(false);
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [fetchFn, retryCount, maxRetries, retryDelay]);

  // Stabilize dependencies to prevent infinite loops
  const stableDependencies = useMemo(() => dependencies, [dependencies]);

  // Combined effect for both initial fetch and dependencies changes
  useEffect(() => {
    // Clear existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    // Reset initial loading state when dependencies change
    hasInitialDataRef.current = false;

    // Fetch data when dependencies change
    fetchData();

    // Only set up interval if refreshInterval is positive
    if (refreshInterval > 0) {
      intervalIdRef.current = setInterval(() => fetchData(false, true), refreshInterval); // Pass isPolling=true
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchData is stable via useCallback; spreading stableDependencies is intentional
  }, [refreshInterval, ...stableDependencies]);

  return {
    data,
    isLoading, // Keep for backward compatibility
    isInitialLoading, // NEW: Only true during first load
    isRefreshing, // NEW: True during background refresh
    error,
    refetch: () => fetchData()
  };
} 