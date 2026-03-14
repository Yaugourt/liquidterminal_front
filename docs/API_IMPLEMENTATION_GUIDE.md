# Guide d'Implémentation d'Appels API

## Architecture Générale

L'architecture API suit un pattern en 4 couches :
1. **API Layer** (`/api.ts`) - Appels HTTP avec axios
2. **Types Layer** (`/types.ts`) - Interfaces TypeScript
3. **Hooks Layer** (`/hooks/`) - Logique React avec useDataFetching
4. **Components Layer** - Utilisation des hooks dans les composants

## 1. Structure des Fichiers

Pour chaque nouveau service, créer cette structure :
```
src/services/[service-name]/
├── api.ts              # Appels API
├── types.ts            # Interfaces TypeScript
├── hooks/              # Hooks React
│   ├── use[ServiceName].ts
│   └── use[ServiceName]Paginated.ts
└── index.ts            # Exports centralisés
```

## 2. Implémentation API Layer (`api.ts`)

### Template de Base
```typescript
import { get, post, put, del, getExternal, postExternal } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { API_URLS } from '../api/constants';
import { 
  ServiceData, 
  ServiceParams, 
  ServiceResponse,
  ServicePaginatedResponse 
} from './types';

/**
 * Récupère les données du service
 */
export const fetchServiceData = async (params?: ServiceParams): Promise<ServiceResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const endpoint = `/api/service${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<ServiceResponse>(endpoint);
  }, 'fetching service data');
};

/**
 * Crée une nouvelle entrée
 */
export const createServiceEntry = async (data: Partial<ServiceData>): Promise<ServiceData> => {
  return withErrorHandling(async () => {
    return await post<ServiceData>('/api/service', data);
  }, 'creating service entry');
};

/**
 * Met à jour une entrée existante
 */
export const updateServiceEntry = async (id: string, data: Partial<ServiceData>): Promise<ServiceData> => {
  return withErrorHandling(async () => {
    return await put<ServiceData>(`/api/service/${id}`, data);
  }, 'updating service entry');
};

/**
 * Supprime une entrée
 */
export const deleteServiceEntry = async (id: string): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`/api/service/${id}`);
  }, 'deleting service entry');
};

/**
 * Appel API externe (ex: Hyperliquid)
 */
export const fetchExternalData = async (params: any): Promise<any> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.EXTERNAL_API}/endpoint`;
    return await postExternal<any>(url, params);
  }, 'fetching external data');
};
```

### Règles API Layer
- **TOUJOURS** utiliser `withErrorHandling` pour wrapper les appels
- **TOUJOURS** utiliser les helpers (`get`, `post`, `put`, `del`) au lieu d'axios direct
- **TOUJOURS** typer les réponses avec des interfaces TypeScript
- **TOUJOURS** ajouter une description JSDoc pour chaque fonction
- **TOUJOURS** utiliser des noms de contexte explicites pour l'error handling

## 3. Implémentation Types Layer (`types.ts`)

### Template de Base
```typescript
// ==================== DONNÉES DE BASE ====================
export interface ServiceData {
  id: string;
  name: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  // Autres propriétés spécifiques
}

// ==================== PARAMÈTRES DE REQUÊTE ====================
export interface ServiceParams {
  limit?: number;
  page?: number;
  sortBy?: 'name' | 'value' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  // Filtres spécifiques
  status?: 'active' | 'inactive' | 'all';
  search?: string;
  dateFrom?: number;
  dateTo?: number;
}

// ==================== RÉPONSES API ====================
export interface ServiceResponse {
  success: boolean;
  data: ServiceData[];
  message?: string;
}

export interface ServicePaginatedResponse {
  data: ServiceData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalVolume?: number; // Si applicable
  };
  metadata?: {
    lastUpdate: number;
    // Autres métadonnées spécifiques
  };
}

// ==================== RÉSULTATS DE HOOKS ====================
export interface UseServiceResult {
  data: ServiceData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  // Propriétés spécifiques au service
}

export interface UseServicePaginatedResult extends UseServiceResult {
  total: number;
  page: number;
  totalPages: number;
  totalVolume?: number;
  updateParams: (params: Partial<ServiceParams>) => void;
  metadata?: {
    lastUpdate: number;
  };
}

// ==================== OPTIONS DE HOOKS ====================
export interface UseServiceOptions {
  limit?: number;
  defaultParams?: Partial<ServiceParams>;
  initialData?: ServiceData[];
  refreshInterval?: number;
}
```

### Règles Types Layer
- **TOUJOURS** organiser les types par catégories (données, paramètres, réponses, hooks)
- **TOUJOURS** utiliser des interfaces plutôt que des types pour l'extensibilité
- **TOUJOURS** préfixer les interfaces de hooks avec `Use`
- **TOUJOURS** inclure `isLoading`, `error`, `refetch` dans les résultats de hooks
- **TOUJOURS** typer les paramètres de tri et pagination de manière cohérente

## 4. Implémentation Hooks Layer (`hooks/`)

### Hook Simple (`useService.ts`)
```typescript
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchServiceData } from '../api';
import { UseServiceResult, ServiceParams, ServiceResponse } from '../types';

export const useService = (
  params?: ServiceParams,
  initialData?: ServiceResponse
): UseServiceResult => {
  const { data, isLoading, error, refetch } = useDataFetching<ServiceResponse>({
    fetchFn: () => fetchServiceData(params),
    initialData,
    dependencies: [JSON.stringify(params)], // Sérialiser les objets complexes
    refreshInterval: 30000 // 30 secondes par défaut
  });

  return {
    data: data?.data || [],
    isLoading,
    error,
    refetch
  };
};
```

### Hook Paginé (`useServicePaginated.ts`)
```typescript
import { useState, useCallback, useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchServiceData } from '../api';
import { 
  ServiceParams, 
  ServicePaginatedResponse, 
  UseServiceOptions,
  UseServicePaginatedResult 
} from '../types';

export function useServicePaginated({
  limit = 50,
  defaultParams = {},
  initialData
}: UseServiceOptions = {}): UseServicePaginatedResult {
  const [params, setParams] = useState<ServiceParams>(() => ({
    limit,
    page: defaultParams.page || 1,
    sortBy: defaultParams.sortBy || 'createdAt',
    sortOrder: defaultParams.sortOrder || 'desc',
    ...defaultParams,
  }));

  const { 
    data: response, 
    isLoading, 
    error,
    refetch
  } = useDataFetching<ServicePaginatedResponse>({
    fetchFn: async () => {
      const response = await fetchServiceData(params);
      return response;
    },
    refreshInterval: 30000,
    maxRetries: 3,
    dependencies: [params], // Utiliser l'objet params directement
    initialData: initialData ? {
      data: initialData,
      pagination: {
        total: initialData.length,
        page: 1,
        limit: initialData.length,
        totalPages: 1,
        totalVolume: 0
      }
    } : undefined
  });

  const updateParams = useCallback((newParams: Partial<ServiceParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Memoized results pour optimiser les re-renders
  const results = useMemo(() => ({
    data: response?.data || [],
    total: response?.pagination.total || 0,
    page: response?.pagination.page || 1,
    totalPages: response?.pagination.totalPages || 0,
    totalVolume: response?.pagination.totalVolume || 0,
    metadata: response?.metadata,
    isLoading,
    error,
    updateParams,
    refetch
  }), [response, isLoading, error, updateParams, refetch]);

  return results;
}
```

### Hook Spécialisé (`useServiceByUser.ts`)
```typescript
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchUserServiceData } from '../api';
import { UseServiceResult, ServiceData } from '../types';

export function useServiceByUser(
  userId: string,
  initialData?: ServiceData[]
): UseServiceResult {
  const { data, isLoading, error, refetch } = useDataFetching<ServiceData[]>({
    fetchFn: () => userId ? fetchUserServiceData(userId) : Promise.resolve([]),
    initialData,
    dependencies: [userId],
    refreshInterval: 30000
  });

  return {
    data: data || [],
    isLoading,
    error,
    refetch
  };
}
```

### Règles Hooks Layer
- **TOUJOURS** utiliser `useDataFetching` comme base
- **TOUJOURS** inclure `dependencies` pour les re-fetches automatiques
- **TOUJOURS** gérer les cas où les paramètres sont undefined/null
- **TOUJOURS** utiliser `useMemo` pour les résultats complexes
- **TOUJOURS** utiliser `useCallback` pour les fonctions de mise à jour
- **TOUJOURS** définir un `refreshInterval` approprié (30s par défaut)

## 5. Configuration useDataFetching

### Options Recommandées
```typescript
const { data, isLoading, error, refetch } = useDataFetching<ResponseType>({
  fetchFn: () => apiCall(params),
  refreshInterval: 30000,        // 30s pour données normales
  refreshInterval: 10000,        // 10s pour données temps réel
  refreshInterval: 60000,        // 60s pour données statiques
  maxRetries: 3,                 // 3 tentatives par défaut
  retryDelay: 1000,             // 1s entre les tentatives
  dependencies: [param1, param2], // Dépendances primitives
  dependencies: [JSON.stringify(complexObject)], // Objets complexes
  initialData: mockData || null  // Données initiales si disponibles
});
```

## 6. Gestion des Erreurs

### Pattern Standard
```typescript
// Dans l'API
export const fetchData = async (): Promise<DataType> => {
  return withErrorHandling(async () => {
    return await get<DataType>('/endpoint');
  }, 'fetching data'); // Contexte descriptif
};

// Dans le hook
const { data, isLoading, error, refetch } = useDataFetching<DataType>({
  fetchFn: fetchData,
  // ... autres options
});

// Dans le composant
if (error) {
  return <ErrorComponent message={error.message} onRetry={refetch} />;
}
```

## 7. Patterns Avancés

### Pagination Côté Client
```typescript
// Pour les APIs qui retournent toutes les données
const { data, isLoading, error } = useDataFetching({
  fetchFn: async () => {
    const response = await fetchAllData();
    // Filtrer et paginer côté client
    const filtered = response.data.filter(item => filterCondition(item));
    const paginated = filtered.slice(startIndex, endIndex);
    return { data: paginated, total: filtered.length };
  },
  dependencies: [page, limit, filters]
});
```

### Enrichissement de Données
```typescript
// Combiner plusieurs sources de données
const { data, isLoading, error } = useDataFetching({
  fetchFn: async () => {
    const [baseData, enrichmentData] = await Promise.all([
      fetchBaseData(),
      fetchEnrichmentData()
    ]);
    
    return baseData.map(item => ({
      ...item,
      enrichedField: enrichmentData.find(e => e.id === item.id)?.value
    }));
  },
  dependencies: [baseParams, enrichmentParams]
});
```

### Cache Conditionnel
```typescript
// Utiliser le cache seulement pour certaines requêtes
const { data, isLoading, error } = useDataFetching({
  fetchFn: () => get('/endpoint', params, { 
    useCache: shouldUseCache,
    retryOnError: shouldRetry 
  }),
  dependencies: [params]
});
```

## 8. Exemples Complets

### Service Simple (Fees)
```typescript
// api.ts
export const fetchFeesStats = async (): Promise<FeesStats> => {
  return withErrorHandling(async () => {
    return await get<FeesStats>('/market/fees');
  }, 'fetching fees stats');
};

// hooks/useFees.ts
export const useFees = () => {
  const { data, isLoading, error, refetch } = useDataFetching<FeesStats>({
    fetchFn: fetchFeesStats,
    refreshInterval: 30000
  });

  return { fees: data, isLoading, error, refetch };
};
```

### Service Paginé (Orders)
```typescript
// api.ts
export const fetchOrders = async (params: OrderParams): Promise<OrderPaginatedResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const endpoint = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<OrderPaginatedResponse>(endpoint);
  }, 'fetching orders');
};

// hooks/useOrders.ts
export function useOrders(options: UseOrdersOptions = {}) {
  const [params, setParams] = useState<OrderParams>({
    limit: options.limit || 50,
    page: 1,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { data, isLoading, error, refetch } = useDataFetching<OrderPaginatedResponse>({
    fetchFn: () => fetchOrders(params),
    refreshInterval: 30000,
    dependencies: [params]
  });

  const updateParams = useCallback((newParams: Partial<OrderParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    orders: data?.data || [],
    total: data?.pagination.total || 0,
    page: data?.pagination.page || 1,
    totalPages: data?.pagination.totalPages || 0,
    isLoading,
    error,
    updateParams,
    refetch
  };
}
```

## 9. Checklist d'Implémentation

### Avant de Commencer
- [ ] Définir la structure des données et les endpoints
- [ ] Identifier les besoins de pagination/tri/filtrage
- [ ] Déterminer la fréquence de rafraîchissement appropriée
- [ ] Vérifier si des données externes doivent être combinées

### Implémentation
- [ ] Créer les interfaces TypeScript dans `types.ts`
- [ ] Implémenter les fonctions API dans `api.ts`
- [ ] Créer les hooks dans `hooks/`
- [ ] Tester les appels API avec des données réelles
- [ ] Vérifier la gestion d'erreur et les retry
- [ ] Optimiser les performances avec `useMemo`/`useCallback`

### Validation
- [ ] Tous les appels utilisent `withErrorHandling`
- [ ] Tous les hooks utilisent `useDataFetching`
- [ ] Les types sont complets et cohérents
- [ ] Les dépendances sont correctement définies
- [ ] Le cache et retry fonctionnent correctement
- [ ] Les erreurs sont gérées gracieusement

## 10. Bonnes Pratiques

### Performance
- Utiliser `useMemo` pour les calculs coûteux
- Utiliser `useCallback` pour les fonctions de mise à jour
- Éviter les re-renders inutiles avec des dépendances optimisées
- Implémenter la pagination côté serveur quand possible

### Maintenance
- Documenter toutes les fonctions API avec JSDoc
- Utiliser des noms de contexte explicites pour l'error handling
- Grouper les types par catégories logiques
- Maintenir la cohérence des patterns entre services

### Sécurité
- Valider les paramètres côté client ET serveur
- Utiliser les helpers axios centralisés pour l'auth automatique
- Ne jamais exposer de tokens ou secrets dans les logs
- Gérer les erreurs 401/403 de manière appropriée

Ce guide garantit une implémentation cohérente et maintenable des appels API dans le projet. 