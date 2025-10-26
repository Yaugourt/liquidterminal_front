/**
 * Token Service - Gestion du refresh et de la queue des tokens
 */

import { QueueItem } from './types';
import { getPrivyToken } from './privy.service';
import { isValidJWT } from './jwt.service';

// Token refresh state
let isRefreshingToken = false;
let failedQueue: QueueItem[] = [];

/**
 * Process the failed requests queue
 */
const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const token = await getPrivyToken();
    return token && isValidJWT(token) ? token : null;
  } catch {
    return null;
  }
};

/**
 * Handle token refresh with queue management
 */
export const handleTokenRefresh = async (): Promise<string> => {
  // If refresh is already in progress, add to queue
  if (isRefreshingToken) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshingToken = true;

  try {
    const newToken = await refreshToken();
    
    if (newToken) {
      processQueue(null, newToken);
      return newToken;
    } else {
      const error = new Error('Unable to refresh token');
      processQueue(error);
      throw error;
    }
  } catch (error) {
    const refreshError = error instanceof Error 
      ? error 
      : new Error('Token refresh failed');
    processQueue(refreshError);
    throw refreshError;
  } finally {
    isRefreshingToken = false;
  }
};

/**
 * Check if token refresh is in progress
 */
export const isTokenRefreshing = (): boolean => isRefreshingToken;
