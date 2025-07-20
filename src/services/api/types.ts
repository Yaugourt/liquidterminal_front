import { AxiosRequestConfig } from 'axios';

export interface RequestOptions {
  useCache?: boolean;
  retryOnError?: boolean;
  skipAuth?: boolean;
}

export interface CacheEntry<T = any> {
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