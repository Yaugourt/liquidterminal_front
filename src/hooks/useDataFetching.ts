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
 * Only while data is on screen (it stays there meanwhile): an empty card
 * retries at the base pace so its error shows without a ~35 s spinner.
 */
const TRANSPORT_RETRIED_BACKOFF_FACTOR = 4;

/**
 * A poll skips while the previous cycle runs (see `cycleInFlightRef`), but
 * not forever: a fetchFn that hangs (a raw `fetch` without a timeout) would
 * freeze the widget with no stale cue. Past this age the hung cycle is marked
 * failed and the poll restarts it. The longest legit cycle is ~105 s (10 s
 * timeouts through the transport retries, then the stretched hook backoff),
 * hence the 120 s floor.
 */
function hungCycleAfterMs(refreshInterval: number): number {
  return Math.max(2 * refreshInterval, 120_000);
}

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
  /**
   * The fetch error, published only when there is nothing to show: a cycle
   * that fails while data for the current dependencies is on screen keeps
   * that data and sets `isStale` instead, so a transient 429/503/5xx never
   * swaps a loaded card or table for an error panel. Intermediate failures
   * (a retry is scheduled) are never published either.
   */
  const [error, setError] = useState<Error | null>(null);
  /** True when the last fetch cycle failed and `data` is the previous
   * successful response (kept on screen). Cleared by the next success or a
   * dependency change. Forward it from wrapper hooks and drive the stale cues
   * from it: DataStatus `stale`, `sourceStatus(error, isLoading, isStale)`,
   * TypedDataTable `stale`, a live dot's `connected`. */
  const [isStale, setIsStale] = useState(false);
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
  /** Set on a permanent 4xx with nothing on screen: polling cycles skip until
   * deps change or manual refetch. With data on screen the polls go on (a 404
   * while a backend route deploys must not freeze a loaded widget for good). */
  const permanentErrorRef = useRef(false);
  /**
   * True from the start of a fetch cycle until it ends (success, final
   * failure, permanent error). A failing cycle with its retries can outlast
   * the poll period (transport 1+2+4s, then 4+8+16s stretched backoff ≈ 35s,
   * vs 10–30s polls): a poll tick must not abort it and restart at attempt 0,
   * or the cycle never ends — an empty card would spin forever without an
   * error, a loaded one would never turn stale. Polls skip while it is set;
   * a manual refetch or a dependency change still aborts and restarts, and
   * so does a poll once the cycle is older than `hungCycleAfterMs`.
   */
  const cycleInFlightRef = useRef(false);
  /** Epoch ms the current cycle started (watchdog for `cycleInFlightRef`). */
  const cycleStartedAtRef = useRef(0);
  /** Latest `initialData`: what `data` falls back to when a cycle for new
   * dependencies fails (a ref, so an inline literal doesn't rebuild fetchData). */
  const initialDataRef = useRef(initialData);
  useIsomorphicLayoutEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

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
  // `stretched` is threaded the same way: the backoff stretch is decided once per
  // cycle, from the first error — later retries run single-shot at the transport
  // layer, so their own errors are never marked as transport-retried.
  const fetchData = useCallback(async (mode: FetchMode, attempt = 0, stretched = false) => {
    if (!mountedRef.current) return;

    const isRetry = attempt > 0;
    const isPolling = mode === 'poll';

    // A missing route stays missing: don't re-poll it every interval.
    if (isPolling && permanentErrorRef.current) return;
    // The previous cycle (or its retries) is still running: let it finish —
    // unless it has hung, then report it like a failed cycle and restart.
    if (isPolling && !isRetry && cycleInFlightRef.current) {
      if (Date.now() - cycleStartedAtRef.current < hungCycleAfterMs(refreshInterval)) return;
      if (hasInitialDataRef.current) {
        setIsStale(true);
      } else {
        setData(initialDataRef.current ?? null);
        setError(new Error('The request timed out'));
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    }
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
      cycleInFlightRef.current = true;
      cycleStartedAtRef.current = Date.now();
    }
    const signal = abortControllerRef.current?.signal;

    // Final failure with no data for the current dependencies. `data` may
    // still hold the previous dependencies' response (kept while the new one
    // loads): drop it, so `error` is never published next to rows that belong
    // to another timeframe, page or filter.
    const failWithoutData = (error: Error) => {
      setData(initialDataRef.current ?? null);
      setError(error);
    };

    // Picked up by the requests fetchFn starts synchronously (request-policy.ts).
    const policy: RequestPolicy = {
      maxCacheAgeMs: cacheMaxAgeFor(mode, refreshInterval),
      // The transport already retried the first attempt's requests.
      ...(isRetry ? { transportRetries: false } : {}),
    };

    // True when this attempt failed and scheduled another: the cycle is not
    // over, so the loading flags stay up and no error is published yet.
    let retryScheduled = false;

    try {
      if (!isRetry) {
        if (isPolling || (mode === 'manual' && hasInitialDataRef.current)) {
          // Background refresh - don't show full loading. With no data, a
          // poll only runs after a final error: that error stays on screen
          // while the poll retries (no error → spinner → error flicker), and
          // the next success replaces it. A manual refetch with data on
          // screen is a background refresh too: the rows stay while it (and
          // its retries) run, the refresh icon spins.
          setIsRefreshing(true);
        } else {
          // Initial load or manual refetch
          setIsLoading(true);
          setIsInitialLoading(true);
          setError(null);
        }
        // New dependencies: the stale flag belonged to the previous data.
        if (!hasInitialDataRef.current) setIsStale(false);
      }

      const result = await runWithRequestPolicy(policy, () => fetchFn(signal));

      if (mountedRef.current && !signal?.aborted) {
        setData(result);
        setError(null);
        setIsStale(false);
        setDataUpdatedAt(policy.dataTimestamp ?? Date.now());
        hasInitialDataRef.current = true; // Mark that we have data now
      }
    } catch (err) {
      if (!mountedRef.current || signal?.aborted) return;

      const error = new Error(getErrorMessage(err));
      // Data for the current dependencies is on screen: keep it, mark it stale.
      const keepData = hasInitialDataRef.current;

      if (isPermanentClientError(err)) {
        // No retry either way; with data on screen the next poll asks again.
        if (keepData) {
          setIsStale(true);
        } else {
          permanentErrorRef.current = true;
          failWithoutData(error);
        }
        return;
      }

      if (attempt < maxRetries) {
        const nextAttempt = attempt + 1;
        // The stretch spreads the retries of a loaded widget over the old
        // recovery window. With nothing on screen it would hold an empty card
        // on a spinner for ~35 s: retry at the base pace, the error shows
        // sooner and the polls keep asking afterwards.
        const stretch = keepData && (stretched || isTransportRetried(err));
        const backoffBase = stretch
          ? retryDelay * TRANSPORT_RETRIED_BACKOFF_FACTOR
          : retryDelay;
        const retryDelayWithBackoff = backoffBase * Math.pow(2, nextAttempt - 1);

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            fetchData(mode, nextAttempt, stretch);
          }
        }, retryDelayWithBackoff);
        retryScheduled = true;
      } else if (keepData) {
        setIsStale(true);
      } else {
        failWithoutData(error);
      }
    } finally {
      // The cycle ends on success, on a final failure or on a permanent
      // error — not while a retry is pending (an empty card keeps its
      // loading state rather than flashing an error between attempts).
      // An aborted cycle was superseded: the new one owns the flags.
      if (!retryScheduled && !signal?.aborted) {
        cycleInFlightRef.current = false;
      }
      if (mountedRef.current && !retryScheduled && !signal?.aborted) {
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
    isStale,
    dataUpdatedAt,
    refetch
  };
}
