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

// Types pour les résultats des hooks

export interface UseDashboardStatsResult {
  stats: DashboardGlobalStats | undefined;
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

// UseLatestAuctionsResult supprimé - utiliser le module market/auction

export interface UseTrendingValidatorsResult {
  validators: TrendingValidator[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Type pour les données du bridge Hyperliquid
export interface BridgeData {
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
  bridgeData: BridgeData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// AuctionsResponse supprimé - utiliser le module market/auction 