/**
 * Interface pour un range de distribution des holders
 */
export interface HoldersDistributionRange {
  range: string;
  holdersCount: number;
  totalStaked: number;
  percentage: number;
}

/**
 * Interface pour les statistiques des top holders
 */
export interface TopHoldersStats {
  topCount: number;
  totalStaked: number;
  percentage: number;
}

/**
 * Réponse API pour les statistiques des holders
 */
export interface HoldersStatsResponse {
  success: boolean;
  data: {
    totalHolders: number;
    totalStaked: number;
    averageStaked: number;
    lastUpdate: number;
    distributionByRange: HoldersDistributionRange[];
    topHoldersStats: TopHoldersStats[];
  };
  error?: string;
  code?: string;
}

/**
 * Résultat du hook pour les stats des holders
 */
export interface UseHoldersStatsResult {
  stats: {
    totalHolders: number;
    totalStaked: number;
    averageStaked: number;
    lastUpdate: number;
    distributionByRange: HoldersDistributionRange[];
    topHoldersStats: TopHoldersStats[];
  } | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
