import { AxiosRequestConfig } from 'axios';

export interface RequestOptions {
  useCache?: boolean;
  retryOnError?: boolean;
  skipAuth?: boolean;
  /** Per-request axios timeout (ms); default comes from the client instance (often 10s). */
  timeoutMs?: number;
  /**
   * Cancels the request (and its pending transport retries). Pass the signal
   * `useDataFetching` hands to `fetchFn` when the caller owns the request.
   * Shared reads are only cancelled once every caller waiting on them has
   * cancelled.
   */
  signal?: AbortSignal;
  /**
   * For endpoints whose response depends on who is asking (optional auth), or
   * that need auth and are fetched on mount: on a signed-in visitor's first
   * page load, wait for the on-demand Privy SDK so the request carries the
   * token. Other requests never wait — sent before Privy has loaded, they go
   * out without a token.
   */
  awaitAuth?: boolean;
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
  /** See `RequestOptions.awaitAuth`; read by the request interceptor. */
  awaitAuth?: boolean;
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
  /** The transport layer already retried this request before giving up. */
  transportRetried?: boolean;
} 