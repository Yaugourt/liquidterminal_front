// Type pour les statistiques globales du marché spot
export interface SpotGlobalStats {
  totalVolume24h: number;
  totalPairs: number;
  totalMarketCap: number;
  totalSpotUSDC: number;
  totalHIP2: number;
}

export interface SpotToken {
  name: string;
  logo: string | null;
  price: number;
  marketCap: number;
  volume: number;
  change24h: number;
  liquidity: number;
  supply: number;
  marketIndex: number;
  tokenId: string;
}

// Paramètres pour les requêtes de marché spot
export interface SpotMarketParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit: number;
  page?: number;
}

export interface UseSpotTokensOptions {
  limit?: number;
  defaultParams?: Partial<SpotMarketParams>;
}

export interface SpotMarketResponse {
  data: SpotToken[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalVolume: number;
} 