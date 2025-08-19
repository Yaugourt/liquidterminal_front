import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_URLS } from './constants';
import { RequestOptions, ExtendedAxiosRequestConfig } from './types';
import { getPrivyToken, handleLogout } from './privy.service';
import { isValidJWT, formatAuthHeader } from './jwt.service';
import { handleTokenRefresh, isTokenRefreshing } from './token.service';
import { generateCacheKey, getCache, setCache } from './cache.service';

// Configuration constants
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

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

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getPrivyToken();
      
      if (token) {
        config.headers.Authorization = formatAuthHeader(token);
      }
      
      // Remove Content-Type for FormData
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    } catch (error) {
      console.warn('Error adding token to request:', error);
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
      // If refresh is already in progress, add to queue
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
  const { useCache = true, retryOnError = true } = options;
  
  // Generate cache key
  const cacheKey = generateCacheKey(
    config.method || 'GET',
    config.url || '',
    config.params,
    config.data
  );

  // Check cache for GET requests
  if (useCache && config.method?.toLowerCase() === 'get') {
    const cached = getCache<T>(cacheKey);
    if (cached) return cached;
  }

  let retries = 0;
  let lastError: Error | null = null;

  while (retries <= MAX_RETRIES) {
    try {
      const response = await client(config);
      const data = response.data;

      // Cache successful GET responses
      if (useCache && config.method?.toLowerCase() === 'get') {
        setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Request failed');

      if (!retryOnError || retries >= MAX_RETRIES) break;

      const delay = BASE_RETRY_DELAY * Math.pow(2, retries);
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

export const getExternal = <T>(url: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(externalApiClient, { method: 'GET', url, params }, options);

export const postExternal = <T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(externalApiClient, { method: 'POST', url, data }, options);

// Utility exports
export { clearCache } from './cache.service';

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
    const { clearAuthTokens } = await import('./privy.service');
    clearAuthTokens();
    return await getPrivyToken();
  } catch {
    return null;
  }
}; 