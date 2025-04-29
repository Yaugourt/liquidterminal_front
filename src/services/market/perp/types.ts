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
}

// Types de tri supportés par l'API
export type PerpSortableFields = "volume" | "openInterest" | "change24h"; 

// Interface pour les statistiques globales des perp
export interface PerpGlobalStats {
  totalVolume24h: number;
  totalTrades24h: number;
  totalOpenInterest: number;
  hlpTvl: number;
  // Ajoutez d'autres champs selon votre API
} 