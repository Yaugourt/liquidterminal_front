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
interface CurrentAuction {
  startTime: number;
  endTime: number;
  startGas: string;
  currentGas: string;
  endGas: string;
}

interface NextAuction {
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
  /** Initial Dutch auction price (top of the curve). */
  startPrice: number;
  /** Floor of the Dutch auction (bottom — usually 500 HYPE). */
  floorPrice: number;
  lastAuctionPrice: number;
  lastAuctionName: string;
  nextAuctionStart: string;
  /** Average winning bid over the last 7d (HYPE). 0 when no data. */
  avg7dPrice: number;
  /** Number of deploys settled in the last 7d. */
  deploys7d: number;
  /** Formatted ETA until `currentPrice` decays to `lastAuctionPrice` ("2h 15m"). */
  etaToLastSold: string;
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
interface PerpCurrentAuction {
  startTime: number;
  endTime: number;
  startGas: string;
  currentGas: string | null;
  endGas: string | null;
}

interface PerpNextAuction {
  startTime: number;
  startGas: string;
}

export interface PerpAuctionTiming {
  currentAuction: PerpCurrentAuction;
  nextAuction: PerpNextAuction;
}

 