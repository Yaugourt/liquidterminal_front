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
} 