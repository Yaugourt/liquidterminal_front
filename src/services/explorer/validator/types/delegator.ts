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
  [key: string]: unknown;
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
  [key: string]: unknown;
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
  [key: string]: unknown;
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