// Types pour les statistiques globales du dashboard
export interface DashboardGlobalStats {
  numberOfUsers: number;
  dailyVolume: number;
  bridgedUsdc: number;
  totalHypeStake: number;
  vaultsTvl: number;
}

// Type pour les validateurs tendance
export interface TrendingValidator {
  name: string;
  stake: number;
  apr: number;
  commission: number;
  uptime: number;
  isActive: boolean;
  nRecentBlocks: number;
}

// Type pour les informations d'enchère
export interface AuctionInfo {
  time: number;
  deployer: string;
  name: string;
  deployGas: string;
  tokenId?: string;
  index?: number;
}

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

// Types pour les résultats des hooks

export interface UseDashboardStatsResult {
  stats: DashboardGlobalStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseTopPerpTokensResult {
  tokens: import('../market/perp/types').PerpMarketData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateParams: (params: any) => void;
  totalVolume?: number;
}

export interface UseTopTokensResult {
  tokens: import('../market/spot/types').SpotToken[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateParams: (params: any) => void;
  totalVolume?: number;
}

export interface UseLatestAuctionsResult {
  auctions: AuctionInfo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseTrendingValidatorsResult {
  validators: TrendingValidator[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Type pour les données du bridge Hyperliquid
export interface HLBridgeData {
  chainTvls: {
    Arbitrum: {
      tvl: Array<{
        date: number;
        totalLiquidityUSD: number;
      }>;
    };
  };
}

export interface UseHLBridgeResult {
  bridgeData: HLBridgeData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} 