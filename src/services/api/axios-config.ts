import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_URLS } from './constants';

// Configuration
const TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Interface pour les options de requête
interface RequestOptions {
  useCache?: boolean;
  retryOnError?: boolean;
  skipAuth?: boolean;
}

// Créer les instances axios
export const apiClient = axios.create({
  baseURL: API_URLS.LOCAL_BACKEND,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const externalApiClient = axios.create({
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement l'auth token
apiClient.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage ou un store
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré, nettoyer l'auth
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

// Fonction pour récupérer le token d'auth
function getAuthToken(): string | null {
  // TODO: Adapter selon votre système d'auth
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Fonction pour nettoyer le token d'auth
function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
}

// Fonction wrapper avec cache et retry
export async function axiosWithConfig<T>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  options: RequestOptions = {}
): Promise<T> {
  const {
    useCache = true,
    retryOnError = true,
  } = options;

  const cacheKey = `${config.method}-${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;

  // Check cache if enabled
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

      // Cache the result if caching is enabled and it's a GET request
      if (useCache && config.method?.toLowerCase() === 'get') {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      lastError = error as Error;

      if (!retryOnError || retries >= MAX_RETRIES) {
        break;
      }

      // Calculate exponential backoff delay
      const delay = BASE_RETRY_DELAY * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }

  throw lastError || new Error('Request failed');
}

// Helpers pour les requêtes courantes
export const get = <T>(url: string, params?: any, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'GET', url, params }, options);

export const post = <T>(url: string, data?: any, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'POST', url, data }, options);

export const put = <T>(url: string, data?: any, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'PUT', url, data }, options);

export const del = <T>(url: string, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(apiClient, { method: 'DELETE', url }, options);

// Helpers pour les APIs externes
export const getExternal = <T>(url: string, params?: any, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(externalApiClient, { method: 'GET', url, params }, options);

export const postExternal = <T>(url: string, data?: any, options?: RequestOptions): Promise<T> =>
  axiosWithConfig<T>(externalApiClient, { method: 'POST', url, data }, options); 