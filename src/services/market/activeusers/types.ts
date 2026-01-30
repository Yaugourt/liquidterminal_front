// ==================== DONNÉES DE BASE ====================
export interface ActiveUser {
  user: string;           // Adresse wallet (0x...)
  fill_count: number;     // Nombre de fills/trades
  total_volume: number;   // Volume total en USD
  unique_coins: number;   // Nombre de coins tradés
  last_activity: string;  // Dernière activité (ISO datetime)
}

// ==================== PARAMÈTRES DE REQUÊTE ====================
export interface ActiveUsersParams {
  hours?: number;  // Fenêtre temporelle (1-168, défaut: 24)
  limit?: number;  // Nombre max d'utilisateurs (1-100, défaut: 100)
}

// ==================== RÉPONSES API ====================
export interface ActiveUsersResponse {
  success: boolean;
  data: ActiveUser[];
  metadata: {
    hours: number;
    limit: number;
    totalCount: number;
    executionTimeMs: number;
    cachedAt: string; // ISO date
  };
}

// ==================== RÉSULTATS DE HOOKS ====================
export interface UseActiveUsersResult {
  users: ActiveUser[];
  metadata: ActiveUsersResponse['metadata'] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ==================== OPTIONS DE HOOKS ====================
export interface UseActiveUsersOptions {
  hours?: number;
  limit?: number;
  initialData?: ActiveUser[];
}
