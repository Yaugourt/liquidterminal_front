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