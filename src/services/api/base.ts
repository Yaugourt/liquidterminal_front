import {  PaginatedResponse } from '../dashboard/types';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;
const CACHE_DURATION = 30000; // 30 seconds

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();

interface RequestOptions extends RequestInit {
  useCache?: boolean;
  retryOnError?: boolean;
}

/**
 * Fetches data with timeout, retry mechanism, and caching
 */
export async function fetchWithConfig<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    useCache = true,
    retryOnError = true,
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKey = `${url}-${JSON.stringify(fetchOptions)}`;

  // Check cache if enabled
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let retries = 0;
  let lastError: Error | null = null;

  while (retries <= MAX_RETRIES) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Cache the result if caching is enabled
      if (useCache) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;

      if (!retryOnError || retries >= MAX_RETRIES) {
        break;
      }

      // Calculate exponential backoff delay
      const delay = BASE_RETRY_DELAY * Math.pow(2, retries);
      console.log(`Retry ${retries + 1}/${MAX_RETRIES} after ${delay}ms for ${url}`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }

  throw lastError || new Error('Request failed');
}

/**
 * Fetches paginated data
 */
export async function fetchPaginated<T>(
  endpoint: string,
  params: Record<string, any> = {},
  options: RequestOptions = {}
): Promise<PaginatedResponse<T>> {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return fetchWithConfig<PaginatedResponse<T>>(url, options);
}

/**
 * Clears the cache for a specific endpoint or all endpoints
 */
export function clearCache(endpoint?: string): void {
  if (endpoint) {
    Array.from(cache.keys()).forEach(key => {
      if (key.startsWith(`${API_BASE_URL}${endpoint}`)) {
        cache.delete(key);
      }
    });
  } else {
    cache.clear();
  }
} 