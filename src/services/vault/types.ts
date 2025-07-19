/**
 * Interface pour un dépôt dans un vault
 */
export interface VaultDeposit {
  vaultAddress: string;
  equity: string;
  lockedUntilTimestamp?: number;
}

/**
 * Paramètres pour la requête de dépôts de vault
 */
export interface VaultDepositsRequest {
  type: "userVaultEquities";
  user: string;
}

/**
 * Réponse de l'API pour les dépôts de vault
 */
export type VaultDepositsResponse = VaultDeposit[];

/**
 * Résultat calculé des dépôts de vault
 */
export interface VaultDepositsCalculatedResult {
  deposits: VaultDeposit[];
  totalEquity: number;
}

/**
 * Résultat du hook pour récupérer les dépôts de vault
 */
export interface UseVaultDepositsResult extends VaultDepositsCalculatedResult {
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Interface pour le résumé d'un vault
 */
export interface VaultSummary {
  summary: {
    name: string;
    vaultAddress: string;
    leader: string;
    tvl: string;
    isClosed: boolean;
    relationship: {
      type: string;
      data: {
        childAddresses: string[];
      };
    };
    createTimeMillis: number;
  };
  apr: number;
}

/**
 * Réponse de l'API pour la liste des vaults
 */
export interface VaultsResponse {
  success: boolean;
  data: VaultSummary[];
  pagination: {
    totalTvl: number;
    total: number;
    page: number;
  };
}

/**
 * Paramètres pour la requête de liste des vaults
 */
export interface VaultsParams {
  page?: number;
  limit?: number;
  sortBy?: 'apr' | 'tvl';
  [key: string]: any;
}

/**
 * Options pour le hook useVaults
 */
export interface UseVaultsOptions {
  page?: number;
  limit?: number;
  sortBy?: 'apr' | 'tvl';
}

/**
 * Résultat du hook pour récupérer la liste des vaults
 */
export interface UseVaultsResult {
  vaults: VaultSummary[];
  totalTvl: number;
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateParams: (params: Partial<VaultsParams>) => void;
}

/**
 * Réponse formatée pour un vault
 */
export interface VaultResponse {
  data: VaultSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalTvl: number;
    vaultsNumber: number;
  };
}

// ==================== VAULT DETAILS CHART ====================

/**
 * Paramètres pour la requête de détails de vault
 */
export interface VaultDetailsRequest {
  type: "vaultDetails";
  vaultAddress: string;
}

/**
 * Données d'historique pour un timeframe
 */
export interface VaultHistoryData {
  accountValueHistory: [number, string][];
  pnlHistory: [number, string][];
  vlm: string;
}

/**
 * Données de portfolio par timeframe
 */
export type VaultPortfolioData = [
  ["day", VaultHistoryData],
  ["week", VaultHistoryData], 
  ["month", VaultHistoryData],
  ["allTime", VaultHistoryData],
  ["perpDay", VaultHistoryData]
];

/**
 * Réponse de l'API pour les détails de vault
 */
export interface VaultDetailsResponse {
  portfolio: VaultPortfolioData;
  // Autres propriétés si nécessaires
}

/**
 * Données formatées pour la chart
 */
export interface VaultChartData {
  timestamp: number;
  accountValue: number;
  pnl: number;
  date: string;
}

/**
 * Timeframes disponibles pour la chart
 */
export type VaultChartTimeframe = 'day' | 'week' | 'month' | 'allTime' | 'perpDay';

/**
 * Résultat du hook pour les détails de vault
 */
export interface UseVaultDetailsResult {
  chartData: VaultChartData[];
  timeframe: VaultChartTimeframe;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} 