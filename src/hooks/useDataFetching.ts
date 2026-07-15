import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getErrorMessage } from '@/services/common/utils';

/**
 * A 4xx (except timeout/rate-limit) will not heal by asking again: the
 * route is missing, the params are wrong or the caller is not allowed.
 * Retrying or re-polling those only hammers the backend (QA audit 15/07:
 * dead endpoints were re-fetched forever at ~1 req/s from every consumer).
 */
function isPermanentClientError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const maybe = err as { status?: unknown; response?: { status?: unknown } };
  const status = typeof maybe.status === 'number' ? maybe.status : maybe.response?.status;
  return typeof status === 'number' && status >= 400 && status < 500 && status !== 408 && status !== 429;
}

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
  /** Epoch ms of the most recent successful fetch — null until first success.
   * Use to drive staleness indicators in the UI. */
  const [dataUpdatedAt, setDataUpdatedAt] = useState<number | null>(null);

  // Only keep necessary refs
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const hasInitialDataRef = useRef(false); // NEW: Track if we've loaded data before
  const abortControllerRef = useRef<AbortController | null>(null);
  /** Set on a permanent 4xx: polling cycles skip until deps change or manual refetch. */
  const permanentErrorRef = useRef(false);

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

    // A missing route stays missing: don't re-poll it every interval.
    if (isPolling && permanentErrorRef.current) return;
    if (!isRetry && !isPolling) permanentErrorRef.current = false;

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
        setDataUpdatedAt(Date.now());
        hasInitialDataRef.current = true; // Mark that we have data now
      }
    } catch (err) {
      if (!mountedRef.current || signal?.aborted) return;

      const error = new Error(getErrorMessage(err));

      if (isPermanentClientError(err)) {
        permanentErrorRef.current = true;
        setError(error);
        setRetryCount(0);
        return;
      }

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
    dataUpdatedAt,
    refetch: () => fetchData()
  };
} 