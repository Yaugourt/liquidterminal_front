import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_URLS } from './constants';
import { RequestOptions, CacheEntry, QueueItem, JWTPayload, ExtendedAxiosRequestConfig } from './types';

// Configuration constants
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;
const CACHE_DURATION = 30000;
const MAX_CACHE_SIZE = 100;

// Cache implementation with size limit
const cache = new Map<string, CacheEntry>();

const cleanupCache = () => {
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
    toDelete.forEach(([key]) => cache.delete(key));
  }
};

// Token refresh management
let isRefreshingToken = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

const refreshTokenWithBackoff = async (retryCount = 0): Promise<string | null> => {
  const maxRetries = 3;
  const baseDelay = 1000;
  
  try {
    if (typeof window !== 'undefined') {
      // @ts-ignore - Privy is injected globally
      const privy = window.privy;
      if (privy?.getAccessToken) {
        const newToken = await privy.getAccessToken();
        if (newToken && typeof newToken === 'string') {
          return newToken;
        }
      }
    }
    throw new Error('Failed to refresh token');
  } catch (error) {
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return refreshTokenWithBackoff(retryCount + 1);
    } else {
      throw error instanceof Error ? error : new Error('Token refresh failed');
    }
  }
};

// Axios instances
export const apiClient = axios.create({
  baseURL: API_URLS.LOCAL_BACKEND,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

export const externalApiClient = axios.create({
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// JWT utilities
const decodeJWT = (token: string): JWTPayload | null => {
  try {
    if (!token || typeof token !== 'string') return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const isJWTExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true;
  return decoded.exp < Math.floor(Date.now() / 1000);
};

const isValidJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string' || !token.startsWith('eyJ')) return false;
  const decoded = decodeJWT(token);
  return decoded !== null && !isJWTExpired(token);
};

// Token management
const getAuthTokenSync = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Check privy:pat first
    const privyPat = localStorage.getItem('privy:pat');
    if (privyPat) {
      const cleanToken = privyPat.replace(/^"|"$/g, '');
      if (isValidJWT(cleanToken)) return cleanToken;
    }
    
    // Check other privy keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key?.includes('privy') && key !== 'privy:pat') {
        const value = localStorage.getItem(key);
        
        if (value) {
          if (value.startsWith('eyJ') || value.startsWith('"eyJ')) {
            const cleanToken = value.replace(/^"|"$/g, '');
            if (isValidJWT(cleanToken)) return cleanToken;
          }
          
          try {
            const parsed = JSON.parse(value);
            if (parsed.user?.id?.startsWith('did:privy:')) return parsed.user.id;
            if (parsed.id?.startsWith('did:privy:')) return parsed.id;
          } catch {
            // Silent fail for invalid JSON
          }
        }
      }
    }
    
    // Fallback to authToken
    const authToken = localStorage.getItem('authToken');
    return authToken && isValidJWT(authToken) ? authToken : null;
  } catch {
    return null;
  }
};

const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('privy:pat');
    } catch {
      // Silent fail
    }
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = getAuthTokenSync();
      
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = token.startsWith('did:privy:') ? token : `Bearer ${token}`;
      } else if (!token && config.headers.Authorization) {
        delete config.headers.Authorization;
      }
    } catch {
      // Silent fail - continue without auth
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
      if (isRefreshingToken) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshingToken = true;

      try {
        const newToken = await refreshTokenWithBackoff();
        
        if (newToken) {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'));
          clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
        processQueue(error);
        clearAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return Promise.reject(error);
      } finally {
        isRefreshingToken = false;
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
  const cacheKey = `${config.method}-${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;

  if (useCache && config.method?.toLowerCase() === 'get') {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  let retries = 0;
  let lastError: Error | null = null;

  while (retries <= MAX_RETRIES) {
    try {
      const response = await client(config);
      const data = response.data;

      if (useCache && config.method?.toLowerCase() === 'get') {
        cache.set(cacheKey, { data, timestamp: Date.now() });
        cleanupCache();
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

// HTTP method helpers
export const get = <T>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'GET', url, params }, options);

export const post = <T>(url: string, data?: any, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'POST', url, data }, options);

export const put = <T>(url: string, data?: any, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'PUT', url, data }, options);

export const del = <T>(url: string, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'DELETE', url }, options);

// External API helpers
export const getExternal = <T>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(externalApiClient, { method: 'GET', url, params }, options);

export const postExternal = <T>(url: string, data?: any, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(externalApiClient, { method: 'POST', url, data }, options); 