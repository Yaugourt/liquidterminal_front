/**
 * Interface pour un holder de HYPE staké
 */
export interface StakedHolder {
  address: string;
  amount: number;
}

/**
 * Paramètres pour récupérer la liste des holders
 */
export interface HoldersParams {
  page?: number;
  limit?: number;
}

/**
 * Paramètres pour récupérer les top holders
 */
export interface TopHoldersParams {
  limit?: number;
}

/**
 * Réponse API pour la liste paginée des holders
 */
export interface StakedHoldersResponse {
  success: boolean;
  data: {
    holders: StakedHolder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    metadata: {
      token: string;
      lastUpdate: number;
      holdersCount: number;
    };
  };
  error?: string;
  code?: string;
}

/**
 * Réponse API pour les top holders
 */
export interface TopHoldersResponse {
  success: boolean;
  data: StakedHolder[];
  error?: string;
  code?: string;
}

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
 * Réponse API pour un holder spécifique
 */
export interface HolderResponse {
  success: boolean;
  data?: StakedHolder;
  error?: string;
  code?: string;
}

/**
 * Résultat du hook pour les holders paginés
 */
export interface UseStakingHoldersPaginatedResult {
  holders: StakedHolder[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  total: number;
  page: number;
  totalPages: number;
  metadata?: {
    token: string;
    lastUpdate: number;
    holdersCount: number;
  };
  updateParams: (params: Partial<HoldersParams>) => void;
}

/**
 * Résultat du hook pour les top holders
 */
export interface UseTopHoldersResult {
  topHolders: StakedHolder[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
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


/**
 * Options pour le hook des holders
 */
export interface UseStakingHoldersOptions {
  limit?: number;
  defaultParams?: Partial<HoldersParams>;
  initialData?: StakedHolder[];
  refreshInterval?: number;
} 