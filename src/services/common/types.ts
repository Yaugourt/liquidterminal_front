// Types communs à tous les services

// Type pour la réponse API paginée
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalVolume: number;
  };
  metadata?: {
    lastUpdate: number;
    isFresh: boolean;
    timeSinceLastUpdate: number;
  };
} 