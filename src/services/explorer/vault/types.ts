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
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Paramètres pour la requête de liste des vaults
 */
export interface VaultsParams {
  page?: number;
  limit?: number;
  sortBy?: 'apr' | 'tvl';
  [key: string]: unknown;
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
  /** Epoch ms of the most recent successful fetch — null until first success. */
  dataUpdatedAt: number | null;
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

// ==================== INDEXER VAULT TYPES (HypeDexer) ====================

/** Wrapper returned by all /indexer/* backend routes */
export interface IndexerApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Vault summary from GET /indexer/vaults/vaultSummaries.
 * HypeDexer returns a direct array — no tvl/apr in this endpoint.
 */
export interface IndexerVaultSummaryItem {
  vaultAddress: string;
  name: string;
  leader: string;
  leaderCommission: number;
  isClosed: boolean;
  followerCount: number;
  snapshotTime: number;
  createTime: number;
}

/** The API returns IndexerVaultSummaryItem[] directly at response.data */
export type IndexerVaultSummariesPayload = IndexerVaultSummaryItem[];

/**
 * Snapshot from GET /indexer/vaults/dailySnapshots or /equitySnapshots.
 * Both return identical shapes; dailySnapshots also includes a `day` string.
 */
export interface VaultEquitySnapshot {
  time: number;
  totalDeposits: number;
  accountValue: number;
  totalNotional: number;
  totalRawPnl: number;
  nPositions: number;
  followerCount: number;
}

/** dailySnapshots adds a human-readable date string */
export interface VaultDailySnapshot extends VaultEquitySnapshot {
  day: string;
}

/** The API returns VaultDailySnapshot[] directly at response.data */
export type IndexerDailySnapshotsPayload = VaultDailySnapshot[];

/** The API returns VaultEquitySnapshot[] directly at response.data */
export type IndexerEquitySnapshotsPayload = VaultEquitySnapshot[];

/**
 * Single event from GET /indexer/vaults/vaultLedger.
 * Deposit: userFrom = depositor, userTo = vaultAddress.
 * Withdrawal: userFrom = vaultAddress, userTo = recipient.
 */
export interface VaultLedgerEntry {
  time: number;
  txHash: string;
  userFrom: string;
  userTo: string;
  amount: number;
  token: string;
}

/** The API returns VaultLedgerEntry[] directly at response.data */
export type IndexerVaultLedgerPayload = VaultLedgerEntry[];

/** Follower-count history item inside vaultDetails.portfolio */
export interface IndexerVaultPortfolioEntry {
  time: number;
  followerCount: number;
  leaderCommission: number;
}

/**
 * Vault metadata from GET /indexer/vaults/vaultDetails.
 * Note: no tvl/apr fields — get those from equitySnapshots or useVaults.
 */
export interface IndexerVaultDetailsData {
  vaultAddress: string;
  name: string;
  leader: string;
  leaderCommission: number;
  isClosed: boolean;
  lockupDurationSeconds?: number;
  allowDeposits?: boolean;
  followerCount?: number;
  snapshotTime?: number;
  createTime?: number;
  /** Commission + follower count history (NOT financial PnL data) */
  portfolio?: IndexerVaultPortfolioEntry[];
}

// ==================== HOOK RESULT TYPES ====================

export interface UseVaultSummariesResult {
  summaries: IndexerVaultSummaryItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseVaultDailySnapshotsResult {
  snapshots: VaultDailySnapshot[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseVaultEquitySnapshotsResult {
  snapshots: VaultEquitySnapshot[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseVaultLedgerResult {
  entries: VaultLedgerEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseVaultIndexerDetailsResult {
  details: IndexerVaultDetailsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ==================== VAULT LEADERBOARDS ====================

export type VaultLeaderboardWindow = '24h' | '7d';

export interface FollowersGainedItem {
  vaultAddress: string;
  name: string;
  leader: string;
  tvl: number;
  delta: number;
  total: number;
}

export interface OutflowItem {
  vaultAddress: string;
  name: string;
  leader: string;
  tvl: number;
  amountUsd: number;
  percentOfTvl: number;
}

export interface VaultLeaderboardMeta {
  window: VaultLeaderboardWindow;
  computedAt: number;
  sampleSize: number;
}

export interface VaultLeaderboardResponse<T> {
  success: boolean;
  data: T[];
  meta: VaultLeaderboardMeta;
}

export interface UseVaultsLeaderboardsResult {
  followersGained: FollowersGainedItem[];
  outflows: OutflowItem[];
  meta: VaultLeaderboardMeta | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
