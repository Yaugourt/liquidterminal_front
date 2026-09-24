import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, CanceledError } from 'axios';
import { API_URLS } from '../constants';
import { RequestOptions, ExtendedAxiosRequestConfig } from '../types';
import { getPrivyToken, handleLogout, isPrivyAuthenticated } from '../auth/privy.service';
import { formatAuthHeader } from '../auth/jwt.service';
import { handleTokenRefresh, isTokenRefreshing } from '../auth/token.service';
import { generateCacheKey, getCacheEntry, setCache } from '../cache/cache.service';
import { currentRequestPolicy, recordDataTimestamp } from './request-policy';

// Configuration constants
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;
const REFRESH_CIRCUIT_COOLDOWN_MS = 60_000;
const RETRY_JITTER_RATIO = 0.2;
/** A rate limit is retried once, and only if the server asks for no longer than this. */
const MAX_RETRY_AFTER_MS = 10_000;

// Refresh circuit breaker: once a refresh fails, every subsequent 401 in the
// cooldown window short-circuits to logout instead of attempting another refresh.
let refreshCircuitOpenUntil = 0;

const isRefreshCircuitOpen = (): boolean => Date.now() < refreshCircuitOpenUntil;
const tripRefreshCircuit = (): void => {
  refreshCircuitOpenUntil = Date.now() + REFRESH_CIRCUIT_COOLDOWN_MS;
};

// Création des instances Axios
export const apiClient = axios.create({
  baseURL: API_URLS.LOCAL_BACKEND,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

const externalApiClient = axios.create({
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// Host of our own backend, derived once from the configured base URL.
const BACKEND_HOST = (() => {
  try {
    return new URL(API_URLS.LOCAL_BACKEND).host;
  } catch {
    return null;
  }
})();

/**
 * Defense-in-depth: decide whether the Privy JWT may be attached to a request.
 * A relative URL resolves against apiClient.baseURL (our backend) → safe. An
 * absolute URL is only trusted when it points at our backend host, so a request
 * to a third-party host (even if mistakenly issued through apiClient) never
 * leaks the user's backend token.
 */
const targetsBackend = (url?: string): boolean => {
  if (!url || !/^https?:\/\//i.test(url)) return true;
  try {
    return BACKEND_HOST !== null && new URL(url).host === BACKEND_HOST;
  } catch {
    return false;
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (targetsBackend(config.url)) {
        const token = await getPrivyToken();

        if (token) {
          config.headers.Authorization = formatAuthHeader(token);
        }
      }

      // Remove Content-Type for FormData
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    } catch {
      // Token addition failed, continue without it
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Anonymous visitors: a 401 just means "not signed in". There is no
      // Privy session to refresh and nothing to log out, so bail out before
      // spamming the token/logout endpoints with calls that can only fail.
      if (!isPrivyAuthenticated()) {
        return Promise.reject(error);
      }

      // Circuit open: a previous refresh failed recently. Bail out immediately.
      if (isRefreshCircuitOpen()) {
        return Promise.reject(error);
      }

      // If refresh is already in progress, queue on its outcome.
      if (isTokenRefreshing()) {
        try {
          const token = await handleTokenRefresh();
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = formatAuthHeader(token);
          }
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;

      try {
        const newToken = await handleTokenRefresh();

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = formatAuthHeader(newToken);
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        tripRefreshCircuit();
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Main wrapper function
export async function axiosWithConfig<T>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  options: RequestOptions = {}
): Promise<T> {
  // Read synchronously, before any await: the policy is only set while the
  // calling fetchFn runs its synchronous part (see request-policy.ts).
  const policy = currentRequestPolicy();
  const { useCache = true, timeoutMs, signal } = options;
  // An explicit option wins; otherwise the hook's own retries run single-shot.
  const retryOnError = options.retryOnError ?? policy?.transportRetries ?? true;

  const requestConfig: ExtendedAxiosRequestConfig = {
    ...config,
    ...(timeoutMs !== undefined ? { timeout: timeoutMs } : {}),
  };

  // Generate cache key
  const cacheKey = generateCacheKey(
    requestConfig.method || 'GET',
    requestConfig.url || '',
    requestConfig.params,
    requestConfig.data
  );

  // Check cache for GET requests
  if (useCache && requestConfig.method?.toLowerCase() === 'get') {
    const cached = getCacheEntry<T>(cacheKey, policy?.maxCacheAgeMs);
    if (cached && cached.data) {
      recordDataTimestamp(policy, cached.timestamp);
      return cached.data;
    }
  }

  // Identical reads fired at the same moment (several hooks mounting on one
  // page) share one request instead of each hitting the upstream — the HL
  // info API rate-limits per IP and the address page alone opened the same
  // ledger three times.
  const data = isShareableRead(client, requestConfig, useCache)
    ? await joinSharedRead<T>(
        cacheKey,
        (sharedSignal) => runRequest<T>(client, requestConfig, cacheKey, useCache, retryOnError, sharedSignal),
        signal
      )
    : await runRequest<T>(client, requestConfig, cacheKey, useCache, retryOnError, signal);

  recordDataTimestamp(policy, Date.now());
  return data;
}

/**
 * An in-flight read shared by every caller asking for the same key. It is only
 * cancelled once all its callers have cancelled — never while a caller that
 * cannot cancel (no signal) still waits on it.
 */
interface SharedRead {
  promise: Promise<unknown>;
  controller: AbortController;
  /** Callers with a signal that are still waiting. */
  cancellableWaiters: number;
  /** A caller without a signal waits on it: never cancel. */
  pinned: boolean;
}

/** In-flight reads, keyed like the response cache. */
const inflight = new Map<string, SharedRead>();

function joinSharedRead<T>(
  key: string,
  start: (signal: AbortSignal) => Promise<T>,
  callerSignal?: AbortSignal
): Promise<T> {
  if (callerSignal?.aborted) return Promise.reject(new CanceledError());

  let entry = inflight.get(key);
  if (!entry) {
    const created: SharedRead = {
      promise: Promise.resolve(),
      controller: new AbortController(),
      cancellableWaiters: 0,
      pinned: false,
    };
    created.promise = start(created.controller.signal).finally(() => {
      if (inflight.get(key) === created) inflight.delete(key);
    });
    // Every caller observes the outcome through its own chain; this branch only
    // keeps a read nobody waits on anymore (all cancelled) from being reported
    // as an unhandled rejection.
    created.promise.catch(() => {});
    inflight.set(key, created);
    entry = created;
  }

  const shared = entry;
  const promise = shared.promise as Promise<T>;
  if (!callerSignal) {
    shared.pinned = true;
    return promise;
  }

  shared.cancellableWaiters++;
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      shared.cancellableWaiters--;
      if (shared.cancellableWaiters === 0 && !shared.pinned) {
        // Next caller starts a fresh request instead of joining a cancelled one.
        if (inflight.get(key) === shared) inflight.delete(key);
        shared.controller.abort();
      }
      reject(new CanceledError());
    };
    callerSignal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        callerSignal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error: unknown) => {
        callerSignal.removeEventListener('abort', onAbort);
        reject(error);
      }
    );
  });
}

/** Read-only HL endpoints — POST bodies there are queries, never actions. */
const HL_READ_URLS = new Set([
  `${API_URLS.HYPERLIQUID_API}/info`,
  `${API_URLS.HYPERLIQUID_UI_API}/info`,
  `${API_URLS.HYPERLIQUID_RPC}/explorer`,
]);

function isShareableRead(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  useCache: boolean
): boolean {
  const method = config.method?.toLowerCase();
  if (method === 'get') return useCache;
  return method === 'post' && client === externalApiClient && HL_READ_URLS.has(config.url ?? '');
}

/**
 * Marks an error whose retry policy the transport layer already applied, so
 * `useDataFetching` doesn't stack its own full retry cycle on top of it.
 */
function markTransportRetried(error: unknown): void {
  if (error && typeof error === 'object') {
    (error as { transportRetried?: boolean }).transportRetried = true;
  }
}

/** True if the transport layer already retried the request behind `error`. */
export function isTransportRetried(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    (error as { transportRetried?: unknown }).transportRetried === true
  );
}

/** `Retry-After` (delta-seconds or HTTP date) in ms, if the response exposes it. */
function parseRetryAfterMs(headers: unknown): number | null {
  if (!headers || typeof headers !== 'object') return null;
  const raw = (headers as Record<string, unknown>)['retry-after'];
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(String(raw));
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

function backoffDelay(retries: number): number {
  const baseDelay = BASE_RETRY_DELAY * Math.pow(2, retries);
  const jitter = baseDelay * RETRY_JITTER_RATIO * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(baseDelay + jitter));
}

/** Waits `ms`, rejecting early with a CanceledError if `signal` aborts. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new CanceledError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new CanceledError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function runRequest<T>(
  client: AxiosInstance,
  requestConfig: ExtendedAxiosRequestConfig,
  cacheKey: string,
  useCache: boolean,
  retryOnError: boolean,
  signal?: AbortSignal
): Promise<T> {
  let retries = 0;
  let rateLimitRetried = false;
  let lastError: Error | null = null;
  const config: ExtendedAxiosRequestConfig = signal ? { ...requestConfig, signal } : requestConfig;

  while (retries <= MAX_RETRIES) {
    try {
      const response = await client(config);
      const data = response.data;

      // Cache successful GET responses
      if (useCache && requestConfig.method?.toLowerCase() === 'get') {
        setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Request failed');

      // Determine if the error is retryable (network/timeout/5xx/429). Do not retry 4xx like 404.
      // A cancellation (ERR_CANCELED) is never retryable.
      const axiosError = error as AxiosError;
      const status = axiosError?.response?.status;
      const code = (axiosError as unknown as { code?: string })?.code;

      const isRateLimited = status === 429;
      const isRetryableStatus = isRateLimited || (typeof status === 'number' && status >= 500);
      const isNetworkOrTimeout = code === 'ECONNABORTED' || code === 'ETIMEDOUT' || code === 'ERR_NETWORK';

      if (!retryOnError || !(isRetryableStatus || isNetworkOrTimeout)) break;
      markTransportRetried(error);
      if (retries >= MAX_RETRIES) break;

      let delay = backoffDelay(retries);
      if (isRateLimited) {
        // Hammering a rate limit only extends it: retry once, honouring
        // Retry-After when the server sends (and CORS exposes) one.
        if (rateLimitRetried) break;
        const retryAfter = parseRetryAfterMs(axiosError.response?.headers);
        if (retryAfter !== null) {
          if (retryAfter > MAX_RETRY_AFTER_MS) break;
          delay = retryAfter;
        }
        rateLimitRetried = true;
      }

      await sleep(delay, signal);
      retries++;
    }
  }

  throw lastError || new Error('Request failed');
}

// HTTP helpers
export const get = <T>(url: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'GET', url, params }, options);

export const post = <T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'POST', url, data }, options);

export const put = <T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'PUT', url, data }, options);

export const del = <T>(url: string, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'DELETE', url }, options);

export const patch = <T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'PATCH', url, data }, options);

export const getExternal = <T>(url: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(externalApiClient, { method: 'GET', url, params }, options);

export const postExternal = <T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(externalApiClient, { method: 'POST', url, data }, options);

// Utility exports
export { clearCache } from '../cache/cache.service';
 