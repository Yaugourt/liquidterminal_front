// Types communs pour les réponses API

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  response?: {
    status: number;
    data: any;
  };
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalVolume?: number;
    totalTvl?: number;
  };
  metadata?: {
    lastUpdate?: number;
    splitTimestamp?: number;
  };
}

// Types pour les requêtes avec options
export interface RequestOptions {
  useCache?: boolean;
  retryOnError?: boolean;
  skipAuth?: boolean;
}

// Types pour les paramètres de requête
export interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

// Types pour les APIs externes
export interface ExternalApiResponse<T = any> {
  [key: string]: any;
}

// Types pour Hyperliquid API
export interface HyperliquidRequest {
  type: string;
  user?: string;
  [key: string]: any;
}

export interface HyperliquidResponse<T = any> {
  [key: string]: T;
} 