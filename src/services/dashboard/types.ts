// Types pour les statistiques globales du dashboard
export interface DashboardGlobalStats {
  numberOfUsers: number;
  dailyVolume: number;
  bridgedUsdc: number;
  totalHypeStake: number;
  vaultsTvl: number;
}



// Types pour les résultats des hooks

export interface UseDashboardStatsResult {
  stats: DashboardGlobalStats | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// UseLatestAuctionsResult supprimé - utiliser le module market/auction



// Type pour les données du bridge Hyperliquid (DefiLlama `hyperliquid-bridge`).
// DefiLlama expose plusieurs `chainTvls` selon les bridges historiques :
// `Arbitrum` (legacy USDC bridge, série longue depuis 2023) et `Hyperliquid L1`
// (bridge natif L1, série plus récente). Les deux coexistent et continuent
// d'être mis à jour ; un consommateur honnête doit les considérer tous les deux.
interface BridgeChainTvl {
  tvl: Array<{
    date: number;
    totalLiquidityUSD: number;
  }>;
}

export interface BridgeData {
  chainTvls: Record<string, BridgeChainTvl>;
  currentChainTvls?: Record<string, number>;
}

export interface UseHLBridgeResult {
  bridgeData: BridgeData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// AuctionsResponse supprimé - utiliser le module market/auction 