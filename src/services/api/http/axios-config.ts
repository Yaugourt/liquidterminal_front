import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_URLS } from '../constants';
import { RequestOptions, ExtendedAxiosRequestConfig } from '../types';
import { getPrivyToken, handleLogout } from '../auth/privy.service';
import { isValidJWT, formatAuthHeader } from '../auth/jwt.service';
import { handleTokenRefresh, isTokenRefreshing } from '../auth/token.service';
import { generateCacheKey, getCache, setCache } from '../cache/cache.service';

// Configuration constants
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;
const REFRESH_CIRCUIT_COOLDOWN_MS = 60_000;
const RETRY_JITTER_RATIO = 0.2;

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

export const externalApiClient = axios.create({
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
  const { useCache = true, retryOnError = true, timeoutMs } = options;

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
    const cached = getCache<T>(cacheKey);
    if (cached) return cached;
  }

  let retries = 0;
  let lastError: Error | null = null;

  while (retries <= MAX_RETRIES) {
    try {
      const response = await client(requestConfig);
      const data = response.data;

      // Cache successful GET responses
      if (useCache && requestConfig.method?.toLowerCase() === 'get') {
        setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Request failed');

      // Determine if the error is retryable (network/timeout/5xx/429). Do not retry 4xx like 404.
      const axiosError = error as AxiosError;
      const status = axiosError?.response?.status;
      const code = (axiosError as unknown as { code?: string })?.code;

      const isRetryableStatus = status === 429 || (typeof status === 'number' && status >= 500);
      const isNetworkOrTimeout = code === 'ECONNABORTED' || code === 'ETIMEDOUT' || code === 'ERR_NETWORK';

      const canRetry = retryOnError && (isRetryableStatus || isNetworkOrTimeout) && retries < MAX_RETRIES;

      if (!canRetry) break;

      const baseDelay = BASE_RETRY_DELAY * Math.pow(2, retries);
      const jitter = baseDelay * RETRY_JITTER_RATIO * (Math.random() * 2 - 1);
      const delay = Math.max(0, Math.round(baseDelay + jitter));
      await new Promise(resolve => setTimeout(resolve, delay));
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

// Token utilities
export const checkTokenValidity = async (): Promise<boolean> => {
  try {
    const token = await getPrivyToken();
    return token ? isValidJWT(token) : false;
  } catch {
    return false;
  }
};

export const forceTokenRefresh = async (): Promise<string | null> => {
  try {
    const { clearAuthTokens } = await import('../auth/privy.service');
    clearAuthTokens();
    return await getPrivyToken();
  } catch {
    return null;
  }
}; 