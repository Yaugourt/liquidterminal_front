/**
 * Interface pour une validation de staking
 */
export interface StakingValidation {
  time: string; // ISO timestamp
  user: string;
  type: 'Delegate' | 'Undelegate';
  amount: number; // HYPE amount (already converted from wei)
  validator: string;
  hash: string;
}

/**
 * Response de l'API pour les validations de staking
 */
export interface StakingValidationsResponse {
  success: boolean;
  data: StakingValidation[];
}

/**
 * Validation de staking formatée pour l'affichage
 */
export interface FormattedStakingValidation {
  time: string;
  timestamp: number;
  user: string;
  type: 'Delegate' | 'Undelegate';
  amount: number;
  validator: string;
  hash: string;
}



/**
 * Paramètres pour la récupération paginée des validations de staking
 */
export interface StakingValidationsParams {
  page?: number;
  limit?: number;
}

/**
 * Réponse paginée pour les validations de staking
 */
export interface StakingValidationsPaginatedResponse {
  data: FormattedStakingValidation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalVolume: number; // Total amount staked/unstaked
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  metadata?: {
    lastUpdate: number;
  };
}

/**
 * Options pour le hook useStakingValidations avec pagination
 */
export interface UseStakingValidationsOptions {
  limit?: number;
  defaultParams?: Partial<StakingValidationsParams>;
  initialData?: FormattedStakingValidation[];
}

/**
 * Résultat du hook paginé pour les validations de staking
 */
export interface UseStakingValidationsPaginatedResult {
  validations: FormattedStakingValidation[];
  total: number;
  page: number;
  totalPages: number;
  totalVolume: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  error: Error | null;
  updateParams: (newParams: Partial<StakingValidationsParams>) => void;
  refetch: () => Promise<void>;
}

/**
 * Interface pour un élément de la queue d'unstaking
 */
export interface UnstakingQueueItem {
  time: string; // ISO timestamp
  user: string;
  amount: number; // HYPE amount (already converted from wei)
}

/**
 * Response de l'API pour la queue d'unstaking
 */
export interface UnstakingQueueResponse {
  success: boolean;
  data: UnstakingQueueItem[];
}

/**
 * Élément de la queue d'unstaking formaté pour l'affichage
 */
export interface FormattedUnstakingQueueItem {
  time: string;
  timestamp: number;
  user: string;
  amount: number;
}

/**
 * Paramètres pour la récupération paginée de la queue d'unstaking
 */
export interface UnstakingQueueParams {
  page?: number;
  limit?: number;
}

/**
 * Réponse paginée pour la queue d'unstaking
 */
export interface UnstakingQueuePaginatedResponse {
  data: FormattedUnstakingQueueItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalVolume: number; // Total amount in unstaking queue
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  metadata?: {
    lastUpdate: number;
  };
}

/**
 * Options pour le hook useUnstakingQueue avec pagination
 */
export interface UseUnstakingQueueOptions {
  limit?: number;
  defaultParams?: Partial<UnstakingQueueParams>;
  initialData?: FormattedUnstakingQueueItem[];
}

/**
 * Résultat du hook paginé pour la queue d'unstaking
 */
export interface UseUnstakingQueuePaginatedResult {
  unstakingQueue: FormattedUnstakingQueueItem[];
  total: number;
  page: number;
  totalPages: number;
  totalVolume: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  error: Error | null;
  updateParams: (newParams: Partial<UnstakingQueueParams>) => void;
  refetch: () => Promise<void>;
}

/**
 * Interface pour les stats quotidiennes d'unstaking
 */
export interface UnstakingDailyStats {
  date: string;
  totalTokens: number;
  transactionCount: number;
  uniqueUsers: number;
}

/**
 * Interface pour les stats totales d'unstaking
 */
export interface UnstakingTotalStats {
  totalTokens: number;
  totalTransactions: number;
  totalUniqueUsers: number;
  averageTokensPerDay: number;
  averageTransactionsPerDay: number;
}

/**
 * Interface pour les stats d'unstaking à venir (1h, 24h, 7j)
 */
export interface UpcomingUnstakingPeriod {
  totalTokens: number;
  transactionCount: number;
  uniqueUsers: number;
}

/**
 * Interface pour toutes les stats d'unstaking à venir
 */
export interface UpcomingUnstakingStats {
  nextHour: UpcomingUnstakingPeriod;
  next24Hours: UpcomingUnstakingPeriod;
  next7Days: UpcomingUnstakingPeriod;
}

/**
 * Réponse API pour les stats d'unstaking
 */
export interface UnstakingStatsResponse {
  success: boolean;
  data: {
    dailyStats: UnstakingDailyStats[];
    totalStats: UnstakingTotalStats;
    upcomingUnstaking: UpcomingUnstakingStats;
    lastUpdate: number;
  };
}



/**
 * Interface pour les données formatées pour la chart
 */
export interface UnstakingChartData {
  day: string;
  date: string;
  totalTokens: number;
  transactionCount: number;
  uniqueUsers: number;
}

/**
 * Résultat du hook avec données formatées pour la chart
 */
export interface UseUnstakingStatsWithChartResult {
  dailyStats: UnstakingDailyStats[];
  totalStats: UnstakingTotalStats | null;
  lastUpdate: number | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  chartData: UnstakingChartData[];
} 