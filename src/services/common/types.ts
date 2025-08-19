// Types communs à tous les services

// Type de base pour la pagination
export interface BasePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Type pour la réponse API paginée
export interface PaginatedResponse<T> {
  data: T[];
  pagination: BasePagination & {
    totalVolume?: number;
  };
  metadata?: {
    lastUpdate: number;
    isFresh: boolean;
    timeSinceLastUpdate: number;
  };
} 