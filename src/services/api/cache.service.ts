/**
 * Cache Service - Gestion optimisée du cache HTTP
 */

import { CacheEntry } from './types';

// Constants
const CACHE_DURATION = 30 * 1000; // 30 seconds
const MAX_CACHE_SIZE = 100;
const CLEANUP_THRESHOLD = 80; // Clean when 80% full

// Cache implementation
const cache = new Map<string, CacheEntry>();
let lastCleanup = 0;
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

/**
 * Generate cache key from request config
 */
export const generateCacheKey = (method: string, url: string, params?: unknown, data?: unknown): string => {
  const paramsStr = params ? JSON.stringify(params) : '';
  const dataStr = data ? JSON.stringify(data) : '';
  return `${method}-${url}-${paramsStr}-${dataStr}`;
};

/**
 * Optimized cache cleanup - only runs when needed
 */
const cleanupCache = (): void => {
  const now = Date.now();
  
  // Skip if cleaned recently
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  // Only cleanup if approaching max size
  if (cache.size < CLEANUP_THRESHOLD) return;
  
  const entries = Array.from(cache.entries());
  
  // Remove expired entries first
  entries.forEach(([key, entry]) => {
    if (now - entry.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  });
  
  // If still too big, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const remainingEntries = Array.from(cache.entries());
    remainingEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toDelete = remainingEntries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
    toDelete.forEach(([key]) => cache.delete(key));
  }
  
  lastCleanup = now;
};

/**
 * Get cached data if valid
 */
export const getCache = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
};

/**
 * Set cache data
 */
export const setCache = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
  cleanupCache();
};

/**
 * Clear all cache
 */
export const clearCache = (): void => {
  cache.clear();
  lastCleanup = 0;
};
