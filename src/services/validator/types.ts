/**
 * Interface pour une délégation de staking
 */
export interface ValidatorDelegation {
  validator: string;
  amount: string;
  lockedUntilTimestamp: number;
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