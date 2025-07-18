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