// Types pour les informations d'enchère
export interface AuctionInfo {
  time: number;
  deployer: string;
  name: string;
  deployGas: string;
  currency: "USDC" | "HYPE";
  deployGasAbs: string;
  tokenId: string;
  index: number;
}

// Nouveaux types pour l'auction timing
export interface CurrentAuction {
  startTime: number;
  endTime: number;
  startGas: string;
  currentGas: string;
  endGas: string;
}

export interface NextAuction {
  startTime: number;
  startGas: string;
}

export interface AuctionTiming {
  currentAuction: CurrentAuction;
  nextAuction: NextAuction;
}

// Type pour les données calculées de l'auction
export interface AuctionState {
  isActive: boolean;
  timeRemaining: string;
  currentPrice: number;
  currentPriceUSD: number;
  progressPercentage: number;
  lastAuctionPrice: number;
  lastAuctionName: string;
  nextAuctionStart: string;
}

// Type pour la réponse API des auctions
export interface AuctionsResponse {
  success: boolean;
  data: {
    usdcAuctions: AuctionInfo[];
    hypeAuctions: AuctionInfo[];
    splitTimestamp: number;
  }
}

// Paramètres pour la récupération des auctions
export interface AuctionParams {
  limit?: number;
  currency?: "HYPE" | "USDC" | "ALL";
  sortBy?: 'time' | 'deployGas';
  sortOrder?: 'asc' | 'desc';
  page?: number;
}

// Réponse avec pagination
export interface AuctionPaginatedResponse {
  data: AuctionInfo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalVolume: number;
  };
  metadata?: {
    lastUpdate: number;
    splitTimestamp: number;
  };
}

// Résultats des hooks
export interface UseAuctionsResult {
  auctions: AuctionInfo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  splitTimestamp?: number;
}

export interface UseAuctionsOptions {
  limit?: number;
  currency?: "HYPE" | "USDC" | "ALL";
  defaultParams?: Partial<AuctionParams>;
  initialData?: AuctionInfo[];
}

// Hook pour l'auction timing
export interface UseAuctionTimingResult {
  auctionState: AuctionState;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ==================== PERP AUCTION TYPES ====================

// Réponse brute API Hyperliquid pour perp deploy auction
export interface PerpDeployAuctionStatus {
  startTimeSeconds: number;
  durationSeconds: number;
  startGas: string;
  currentGas: string | null;
  endGas: string | null;
}

// Types pour perp auction timing (structure similaire à spot)
export interface PerpCurrentAuction {
  startTime: number;
  endTime: number;
  startGas: string;
  currentGas: string | null;
  endGas: string | null;
}

export interface PerpNextAuction {
  startTime: number;
  startGas: string;
}

export interface PerpAuctionTiming {
  currentAuction: PerpCurrentAuction;
  nextAuction: PerpNextAuction;
}

// ==================== PERP DEXS TYPES ====================

// Réponse API Hyperliquid pour perpDexs
export interface PerpDex {
  name: string;
  fullName: string;
  deployer: string;
  oracleUpdater: string;
  feeRecipient: string | null;
  assetToStreamingOiCap: [string, string][];
  gas?: string; // Optionnel pour l'instant, viendra du backend plus tard
  deployerName?: string; // Nom du deployer (viendra du backend)
}

export interface UsePerpDexsResult {
  perpDexs: PerpDex[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} 