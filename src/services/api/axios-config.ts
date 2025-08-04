import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_URLS } from './constants';
import { RequestOptions, CacheEntry, QueueItem, ExtendedAxiosRequestConfig } from './types';

// Extend Window interface for Privy context
declare global {
  interface Window {
    privy?: {
      getAccessToken?: () => Promise<string | null>;
      logout?: () => void;
    };
    __PRIVY_CONTEXT__?: {
      getAccessToken?: () => Promise<string | null>;
    };
  }
}

// Configuration constants
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;
const CACHE_DURATION = 30000;
const MAX_CACHE_SIZE = 100;

// Cache implementation
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

// Fonction améliorée pour récupérer le token Privy
const getPrivyToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Vérifier si Privy est disponible
    const privy = window.privy;
    if (privy?.getAccessToken) {
      // Privy gère automatiquement le refresh
      const token = await privy.getAccessToken();
      return token || null;
    }

    // Fallback vers usePrivy hook si disponible
    if (window.__PRIVY_CONTEXT__?.getAccessToken) {
      const token = await window.__PRIVY_CONTEXT__.getAccessToken();
      return token || null;
    }

    // Dernier recours : localStorage (non recommandé mais nécessaire pour compatibilité)
    return getAuthTokenFromStorage();
  } catch (error) {
    console.warn('Erreur lors de la récupération du token Privy:', error);
    return getAuthTokenFromStorage();
  }
};

// Fonction fallback pour localStorage (simplifié)
const getAuthTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Vérifier privy:pat en premier
    const privyPat = localStorage.getItem('privy:pat');
    if (privyPat) {
      const cleanToken = privyPat.replace(/^"|"$/g, '');
      if (isValidJWT(cleanToken)) return cleanToken;
    }
    
    // Fallback vers authToken
    const authToken = localStorage.getItem('authToken');
    return authToken && isValidJWT(authToken) ? authToken : null;
  } catch {
    return null;
  }
};

// JWT utilities (simplifiés)
const decodeJWT = (token: string): { exp?: number } | null => {
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
  
  // Ajouter une marge de 5 minutes pour éviter les tokens qui expirent pendant la requête
  const expirationBuffer = 5 * 60; // 5 minutes en secondes
  return decoded.exp < Math.floor(Date.now() / 1000) + expirationBuffer;
};

const isValidJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string' || !token.startsWith('eyJ')) return false;
  const decoded = decodeJWT(token);
  return decoded !== null && !isJWTExpired(token);
};

// Fonction simplifiée de refresh des tokens
const refreshToken = async (): Promise<string | null> => {
  try {
    // Utiliser l'API Privy qui gère automatiquement le refresh
    return await getPrivyToken();
  } catch (error) {
    console.error('Erreur lors du refresh du token:', error);
    return null;
  }
};

// Fonction pour nettoyer les tokens
const clearAuthTokens = (): void => {
  if (typeof window !== 'undefined') {
    try {
      // Effacer tous les tokens d'authentification
      localStorage.removeItem('authToken');
      localStorage.removeItem('privy:pat');
      
      // Effacer toutes les clés liées à Privy
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('privy')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
      // Échec silencieux
    }
  }
};

// Fonction pour gérer la déconnexion
const handleLogout = () => {
  clearAuthTokens();
  if (typeof window !== 'undefined') {
    // Essayer d'utiliser l'API Privy pour se déconnecter proprement
    try {
      const privy = window.privy;
      if (privy?.logout) {
        privy.logout();
        return;
      }
    } catch {
      // Si Privy n'est pas disponible, afficher un toast
    }
    
    // Afficher un toast pour informer l'utilisateur
    import('sonner').then(({ toast }) => {
      toast.error('Session expirée. Veuillez vous reconnecter.', {
        duration: 5000
      });
    });
  }
};

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

// Intercepteur de requête amélioré
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Toujours récupérer un token frais (Privy gère le cache et le refresh)
      const token = await getPrivyToken();
      
      if (token) {
        config.headers.Authorization = token.startsWith('did:privy:') 
          ? token 
          : `Bearer ${token}`;
      }
      
      // Supprimer Content-Type pour FormData (upload de fichiers)
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    } catch (error) {
      console.warn('Erreur lors de l\'ajout du token à la requête:', error);
      // Continuer sans authentification
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Intercepteur de réponse amélioré
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Si un refresh est déjà en cours, ajouter à la queue
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
        const newToken = await refreshToken();
        
        if (newToken && isValidJWT(newToken)) {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          // Token refresh a échoué
          const refreshError = new Error('Impossible de rafraîchir le token');
          processQueue(refreshError);
          handleLogout();
          return Promise.reject(refreshError);
        }
      } catch (refreshError) {
        const error = refreshError instanceof Error 
          ? refreshError 
          : new Error('Échec du refresh du token');
        processQueue(error);
        handleLogout();
        return Promise.reject(error);
      } finally {
        isRefreshingToken = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Fonction wrapper principale (inchangée)
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
      return cached.data as T;
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

// Helpers HTTP (inchangés)
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

export const clearCache = (): void => {
  cache.clear();
};

// Utilitaires supplémentaires pour une meilleure intégration Privy
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
    clearAuthTokens();
    return await getPrivyToken();
  } catch {
    return null;
  }
}; 