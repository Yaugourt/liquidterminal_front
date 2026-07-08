export interface PerpMarketData {
  name: string;
  logo: string;
  price: number;
  change24h: number;
  volume: number;
  openInterest: number;
  funding: number;
  maxLeverage: number;
  onlyIsolated: boolean;
  index: number;
}

// Types de tri supportés par l'API
export type PerpSortableFields = "volume" | "openInterest" | "change24h" | "price" | "name"; 

// Interface pour les statistiques globales des perp
// Shape mirrors the backend /market/perp/globalstats response exactly
// (perpStats.service.ts → { totalVolume24h, totalOpenInterest, totalPairs, hlpTvl }).
export interface PerpGlobalStats {
  /** Σ 24h notional volume across all perp markets (USD). */
  totalVolume24h: number;
  /** Σ open interest across all perp markets, in USD (size × mark price). */
  totalOpenInterest: number;
  /** Number of perp markets with non-zero 24h volume. */
  totalPairs: number;
  /** TVL of the HLP vault (USD). */
  hlpTvl: number;
}

// Paramètres pour les requêtes de marché perp
export interface PerpMarketParams {
  sortBy?: PerpSortableFields;
  sortOrder?: 'asc' | 'desc';
  limit: number;
  page?: number;
  [key: string]: unknown;
}

// Options pour le hook usePerpMarkets
export interface UsePerpMarketsOptions {
  limit?: number;
  defaultParams?: Partial<PerpMarketParams>;
}

// Format de réponse de l'API
export interface PerpMarketResponse {
  data: PerpMarketData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalVolume: number;
  hasNext: boolean;
  hasPrevious: boolean;
} 