import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { getErrorMessage } from '@/services/common/utils';
import { isTransportRetried } from '@/services/api/axios-config';
import { runWithRequestPolicy, type RequestPolicy } from '@/services/api/http/request-policy';
import { setVisibleInterval } from '@/lib/visibility';

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

/** What started a fetch cycle — decides how fresh a cached response must be. */
type FetchMode = 'initial' | 'poll' | 'manual';

/**
 * Max age of a cached GET response a cycle accepts:
 * - first load (mount / deps change): any valid entry — instant render;
 * - poll: half the interval, so a poll never reads back its own previous
 *   response (the 30s cache used to turn 10s polls into 30s ones), while
 *   still sharing a sibling's response from a moment ago;
 * - manual refetch: none — a refresh click or a post-mutation refetch must
 *   hit the network.
 */
function cacheMaxAgeFor(mode: FetchMode, refreshInterval: number): number | undefined {
  if (mode === 'manual') return 0;
  if (mode === 'poll' && refreshInterval > 0) return Math.floor(refreshInterval / 2);
  return undefined;
}

/**
 * The hook's retries run single-shot at the transport layer. When the
 * transport had already retried the failing request, their backoff is
 * stretched by this factor: the recovery window stays what it was when every
 * hook retry re-ran a full transport cycle, for ≤7 requests instead of 16.
 */
const TRANSPORT_RETRIED_BACKOFF_FACTOR = 4;

// Layout effect in the browser (runs before any passive effect of the same
// commit), plain effect on the server where layout effects don't run.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface UseDataFetchingOptions<T> {
  /**
   * Fetch function. Accepts an optional `AbortSignal` — if supplied by the consumer,
   * the hook will pass a signal that fires when the hook re-fetches or unmounts.
   * Forward it to the API call (`RequestOptions.signal`) to cancel the request itself.
   * Existing callers that ignore the param remain compatible.
   */
  fetchFn: (signal?: AbortSignal) => Promise<T>;
  /** Poll period in ms (0 = fetch once). Polling pauses while the tab is hidden. */
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
  /** Epoch ms of the data currently shown — its fetch time, or the time the
   * cached response it came from was fetched. null until first success.
   * Use to drive staleness indicators in the UI. */
  const [dataUpdatedAt, setDataUpdatedAt] = useState<number | null>(null);

  // Only keep necessary refs
  /** Stops the current polling timer (see `setVisibleInterval`). */
  const stopPollingRef = useRef<(() => void) | null>(null);
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
      if (stopPollingRef.current) {
        stopPollingRef.current();
        stopPollingRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Main fetch function with retry logic.
  // `attempt` is threaded through the recursive retry calls instead of being read
  // from state: the setTimeout closure captures a stale `retryCount` (always the
  // value at schedule time), which made `retryCount < maxRetries` always true and
  // caused an infinite retry loop (~1 req/1.2s) on any persistent failure (QA audit 15/07).
  const fetchData = useCallback(async (mode: FetchMode, attempt = 0) => {
    if (!mountedRef.current) return;

    const isRetry = attempt > 0;
    const isPolling = mode === 'poll';

    // A missing route stays missing: don't re-poll it every interval.
    if (isPolling && permanentErrorRef.current) return;
    if (!isRetry && !isPolling) permanentErrorRef.current = false;

    // Abort the previous in-flight request (and any pending retry from a
    // previous cycle) before starting a new one.
    if (!isRetry) {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
    }
    const signal = abortControllerRef.current?.signal;

    // Picked up by the requests fetchFn starts synchronously (request-policy.ts).
    const policy: RequestPolicy = {
      maxCacheAgeMs: cacheMaxAgeFor(mode, refreshInterval),
      // The transport already retried the first attempt's requests.
      ...(isRetry ? { transportRetries: false } : {}),
    };

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
      }

      const result = await runWithRequestPolicy(policy, () => fetchFn(signal));

      if (mountedRef.current && !signal?.aborted) {
        setData(result);
        setError(null);
        setDataUpdatedAt(policy.dataTimestamp ?? Date.now());
        hasInitialDataRef.current = true; // Mark that we have data now
      }
    } catch (err) {
      if (!mountedRef.current || signal?.aborted) return;

      const error = new Error(getErrorMessage(err));

      if (isPermanentClientError(err)) {
        permanentErrorRef.current = true;
        setError(error);
        return;
      }

      if (attempt < maxRetries) {
        const nextAttempt = attempt + 1;
        const backoffBase = isTransportRetried(err)
          ? retryDelay * TRANSPORT_RETRIED_BACKOFF_FACTOR
          : retryDelay;
        const retryDelayWithBackoff = backoffBase * Math.pow(2, nextAttempt - 1);

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            fetchData(mode, nextAttempt);
          }
        }, retryDelayWithBackoff);

        setError(new Error(`Retry attempt ${nextAttempt} of ${maxRetries}: ${error.message}`));
      } else {
        setError(error);
      }
    } finally {
      if (mountedRef.current && !isRetry && !signal?.aborted) {
        setIsLoading(false);
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [fetchFn, maxRetries, retryDelay, refreshInterval]);

  // Timers and `refetch` call the latest fetchData, so polls use the current
  // fetchFn rather than the one captured when the interval was created.
  const fetchDataRef = useRef(fetchData);
  useIsomorphicLayoutEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  // Stabilize dependencies to prevent infinite loops
  const stableDependencies = useMemo(() => dependencies, [dependencies]);

  // Combined effect for both initial fetch and dependencies changes
  useEffect(() => {
    // Clear existing polling timer
    if (stopPollingRef.current) {
      stopPollingRef.current();
      stopPollingRef.current = null;
    }

    // Reset initial loading state when dependencies change
    hasInitialDataRef.current = false;

    // Fetch data when dependencies change
    fetchData('initial');

    // Only poll if refreshInterval is positive. Ticks are skipped while the tab
    // is hidden, with one catch-up poll when it becomes visible again.
    if (refreshInterval > 0) {
      stopPollingRef.current = setVisibleInterval(() => {
        void fetchDataRef.current('poll');
      }, refreshInterval);
    }

    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current();
        stopPollingRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchData is stable via useCallback; spreading stableDependencies is intentional
  }, [refreshInterval, ...stableDependencies]);

  // Stable identity: safe in effect / memo dependency lists.
  const refetch = useCallback(() => fetchDataRef.current('manual'), []);

  return {
    data,
    isLoading, // Keep for backward compatibility
    isInitialLoading, // NEW: Only true during first load
    isRefreshing, // NEW: True during background refresh
    error,
    dataUpdatedAt,
    refetch
  };
}
