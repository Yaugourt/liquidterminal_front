// ==================== TYPES DE TRI ====================
export type TopTradersSortType = 'pnl_pos' | 'pnl_neg' | 'volume' | 'trades';

// ==================== DONNÉES DE BASE ====================
export interface TopTrader {
  user: string;           // Adresse wallet (0x...)
  tradeCount: number;     // Nombre de trades sur 24h
  totalVolume: number;    // Volume total en USD
  winRate: number;        // Taux de réussite (0-1, ex: 0.75 = 75%)
  totalPnl: number;       // PnL total en USD (peut être négatif)
}

// ==================== PARAMÈTRES DE REQUÊTE ====================
export interface TopTradersParams {
  sort?: TopTradersSortType;  // Type de classement
  limit?: number;             // Nombre de traders (1-50)
}

// ==================== RÉPONSES API ====================
export interface TopTradersResponse {
  success: boolean;
  data: TopTrader[];
  metadata: {
    sort: TopTradersSortType;
    limit: number;
    executionTimeMs: number;
    cachedAt: string; // ISO date
  };
}

// ==================== RÉSULTATS DE HOOKS ====================
export interface UseTopTradersResult {
  traders: TopTrader[];
  metadata: TopTradersResponse['metadata'] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ==================== OPTIONS DE HOOKS ====================
export interface UseTopTradersOptions {
  sort?: TopTradersSortType;
  limit?: number;
  initialData?: TopTrader[];
}
