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
export interface PerpGlobalStats {
  totalVolume24h: number;
  totalTrades24h: number;
  totalOpenInterest: number;
  hlpTvl: number;
  // Ajoutez d'autres champs selon votre API
}

// Paramètres pour les requêtes de marché perp
export interface PerpMarketParams {
  sortBy?: PerpSortableFields;
  sortOrder?: 'asc' | 'desc';
  limit: number;
  page?: number;
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