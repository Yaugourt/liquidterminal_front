/**
 * Interface pour une délégation de staking
 */
export interface ValidatorDelegation {
  validator: string;
  amount: string;
  lockedUntilTimestamp: number;
  validatorName?: string; // Nom du validator (enrichi par le hook)
}

/**
 * Paramètres pour la requête de délégations
 */
export interface ValidatorDelegationsRequest {
  type: "delegations";
  user: string;
}

/**
 * Réponse de l'API pour les délégations
 */
export type ValidatorDelegationsResponse = ValidatorDelegation[];

/**
 * Résultat calculé des délégations
 */
export interface ValidatorDelegationsCalculatedResult {
  delegations: ValidatorDelegation[];
  totalStaked: number;
}

/**
 * Résultat du hook pour récupérer les délégations
 */
export interface UseValidatorDelegationsResult extends ValidatorDelegationsCalculatedResult {
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Interface pour un validateur avec toutes ses informations
 */
export interface Validator {
  name: string;
  address?: string; // Adresse du validator pour le mapping (legacy)
  validator: string; // Adresse du validator (champ principal de l'API)
  stake: number;
  apr: number;
  commission: number;
  uptime: number;
  isActive: boolean;
  nRecentBlocks: number;
}

/**
 * Statistiques des validateurs
 */
export interface ValidatorStats {
  total: number;
  active: number;
  inactive: number;
  totalHypeStaked: number;
}

/**
 * Résultat du hook pour récupérer tous les validateurs
 */
export interface UseValidatorsResult {
  validators: Validator[];
  stats: ValidatorStats;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

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
 * Résultat du hook pour les validations de staking
 */
export interface UseStakingValidationsResult {
  validations: FormattedStakingValidation[] | null;
  isLoading: boolean;
  error: Error | null;
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
 * Interface pour une action de délégation dans l'historique
 */
export interface DelegationAction {
  validator: string;
  amount: string;
  isUndelegate: boolean;
}

/**
 * Interface pour un élément de l'historique des délégations
 */
export interface DelegatorHistoryItem {
  time: number; // timestamp en millisecondes
  hash: string;
  delta: {
    delegate: DelegationAction;
  };
}

/**
 * Paramètres pour la requête d'historique des délégations
 */
export interface DelegatorHistoryRequest {
  type: "delegatorHistory";
  user: string;
}

/**
 * Réponse de l'API pour l'historique des délégations
 */
export type DelegatorHistoryResponse = DelegatorHistoryItem[];

/**
 * Élément de l'historique des délégations formaté pour l'affichage
 */
export interface FormattedDelegatorHistoryItem {
  time: string;
  timestamp: number;
  hash: string;
  type: 'Delegate' | 'Undelegate';
  amount: number;
  validator: string;
  validatorName?: string;
}

/**
 * Résultat du hook pour l'historique des délégations
 */
export interface UseDelegatorHistoryResult {
  history: FormattedDelegatorHistoryItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Interface pour un élément de récompense de délégation
 */
export interface DelegatorRewardItem {
  time: number; // timestamp en millisecondes
  source: string; // "delegation" ou "commission"
  totalAmount: string;
}

/**
 * Paramètres pour la requête de récompenses des délégations
 */
export interface DelegatorRewardsRequest {
  type: "delegatorRewards";
  user: string;
}

/**
 * Réponse de l'API pour les récompenses des délégations
 */
export type DelegatorRewardsResponse = DelegatorRewardItem[];

/**
 * Élément de récompense des délégations formaté pour l'affichage
 */
export interface FormattedDelegatorRewardItem {
  time: string;
  timestamp: number;
  source: string;
  amount: number;
}

/**
 * Résultat du hook pour les récompenses des délégations
 */
export interface UseDelegatorRewardsResult {
  rewards: FormattedDelegatorRewardItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Interface pour le résumé des délégations d'un utilisateur
 */
export interface DelegatorSummaryData {
  delegated: string;
  undelegated: string;
  totalPendingWithdrawal: string;
  nPendingWithdrawals: number;
}

/**
 * Paramètres pour la requête de résumé des délégations
 */
export interface DelegatorSummaryRequest {
  type: "delegatorSummary";
  user: string;
}

/**
 * Réponse de l'API pour le résumé des délégations
 */
export type DelegatorSummaryResponse = DelegatorSummaryData;

/**
 * Résultat du hook pour le résumé des délégations
 */
export interface UseDelegatorSummaryResult {
  summary: DelegatorSummaryData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} 