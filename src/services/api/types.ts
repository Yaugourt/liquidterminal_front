import { AxiosRequestConfig } from 'axios';

export interface RequestOptions {
  useCache?: boolean;
  retryOnError?: boolean;
  skipAuth?: boolean;
  /** Per-request axios timeout (ms); default comes from the client instance (often 10s). */
  timeoutMs?: number;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

export interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

export interface JWTPayload {
  iss?: string;
  aud?: string;
  sub?: string;
  exp?: number;
  iat?: number;
}

export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Interface pour les erreurs standardisées
export interface StandardError {
  success: false;
  message: string;
  code: string;
  response?: {
    status: number;
    data: unknown;
  };
} 