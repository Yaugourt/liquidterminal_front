import { get, postExternal } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS, API_URLS } from '@/services/api/constants';
import { 
  VaultDepositsRequest, 
  VaultDepositsResponse,
  VaultsParams,
  VaultsResponse,
  VaultResponse,
  VaultDetailsRequest,
  VaultDetailsResponse,
  IndexerApiResponse,
  IndexerVaultSummaryItem,
  VaultDailySnapshot,
  VaultEquitySnapshot,
  VaultLedgerEntry,
  IndexerVaultDetailsData,
  VaultLeaderboardWindow,
  VaultLeaderboardResponse,
  FollowersGainedItem,
  OutflowItem,
} from './types';

/**
 * Adapts the vault response to match the PaginatedResponse format

/**
 * Fetches vaults with pagination and sorting
 */
export const fetchVaults = async (params: VaultsParams): Promise<VaultsResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await get<VaultResponse>(
      `${ENDPOINTS.MARKET_VAULTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );

    return {
      success: true,
      data: response.data,
      pagination: {
        totalTvl: response.pagination.totalTvl,
        total: response.pagination.vaultsNumber,
        page: response.pagination.page,
        limit: response.pagination.limit || params.limit || 10,
        totalPages: response.pagination.totalPages || Math.ceil(response.pagination.vaultsNumber / (params.limit || 10)),
        hasNext: response.pagination.page < (response.pagination.totalPages || 1),
        hasPrevious: response.pagination.page > 1
      }
    };
  }, 'fetching vaults');
};

/**
 * Récupère les dépôts de vault d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns Les dépôts de vault de l'utilisateur
 */
export const fetchVaultDeposits = async (
  params: VaultDepositsRequest
): Promise<VaultDepositsResponse> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.HYPERLIQUID_API}/info`;
    return await postExternal<VaultDepositsResponse>(url, params);
  }, 'fetching vault deposits');
};

/**
 * Récupère les détails d'un vault spécifique pour la chart
 * @param params Les paramètres de la requête avec l'adresse du vault
 * @returns Les détails du vault avec l'historique des données
 */
export const fetchVaultDetails = async (
  params: VaultDetailsRequest
): Promise<VaultDetailsResponse> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.HYPERLIQUID_API}/info`;
    return await postExternal<VaultDetailsResponse>(url, params);
  }, 'fetching vault details');
};

// ==================== INDEXER VAULT API (HypeDexer proxy) ====================

/**
 * Fetches vault summaries from the indexer (one row per vault, sorted by follower count).
 * Returns a direct array — no tvl/apr in this endpoint.
 */
export const fetchIndexerVaultSummaries = async (params?: {
  includeClosed?: boolean;
  limit?: number;
}): Promise<IndexerVaultSummaryItem[]> => {
  return withErrorHandling(async () => {
    const response = await get<IndexerApiResponse<IndexerVaultSummaryItem[]>>(
      ENDPOINTS.INDEXER_VAULT_SUMMARIES,
      params as Record<string, unknown>
    );
    return response.data;
  }, 'fetching indexer vault summaries');
};

/**
 * Fetches vault metadata and portfolio history from the indexer.
 */
export const fetchIndexerVaultDetails = async (params: {
  vaultAddress: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}): Promise<IndexerVaultDetailsData> => {
  return withErrorHandling(async () => {
    const response = await get<IndexerApiResponse<IndexerVaultDetailsData>>(
      ENDPOINTS.INDEXER_VAULT_DETAILS,
      params as Record<string, unknown>
    );
    return response.data;
  }, 'fetching indexer vault details');
};

/**
 * Fetches daily account-value snapshots for a vault from the indexer.
 * Returns a direct array sorted newest-first.
 */
export const fetchVaultDailySnapshots = async (params: {
  vaultAddress: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}): Promise<VaultDailySnapshot[]> => {
  return withErrorHandling(async () => {
    const response = await get<IndexerApiResponse<VaultDailySnapshot[]>>(
      ENDPOINTS.INDEXER_VAULT_DAILY_SNAPSHOTS,
      params as Record<string, unknown>
    );
    return response.data;
  }, 'fetching vault daily snapshots');
};

/**
 * Fetches ~hourly equity snapshots for a vault from the indexer.
 * Returns a direct array sorted newest-first.
 */
export const fetchVaultEquitySnapshots = async (params: {
  vaultAddress: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}): Promise<VaultEquitySnapshot[]> => {
  return withErrorHandling(async () => {
    const response = await get<IndexerApiResponse<VaultEquitySnapshot[]>>(
      ENDPOINTS.INDEXER_VAULT_EQUITY_SNAPSHOTS,
      params as Record<string, unknown>
    );
    return response.data;
  }, 'fetching vault equity snapshots');
};

/**
 * Fetches deposit/withdrawal events for a vault from the indexer.
 * Returns a direct array sorted newest-first.
 */
export const fetchVaultLedger = async (params: {
  vaultAddress: string;
  user?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}): Promise<VaultLedgerEntry[]> => {
  return withErrorHandling(async () => {
    const response = await get<IndexerApiResponse<VaultLedgerEntry[]>>(
      ENDPOINTS.INDEXER_VAULT_LEDGER,
      params as Record<string, unknown>
    );
    return response.data;
  }, 'fetching vault ledger');
};

/**
 * Fetches the followers-gained leaderboard from the back. Top vaults by net
 * follower delta over the given window.
 */
export const fetchFollowersGainedLeaderboard = async (params: {
  window?: VaultLeaderboardWindow;
  limit?: number;
}): Promise<VaultLeaderboardResponse<FollowersGainedItem>> => {
  return withErrorHandling(async () => {
    return await get<VaultLeaderboardResponse<FollowersGainedItem>>(
      ENDPOINTS.INDEXER_VAULT_LEADERBOARD_FOLLOWERS,
      params as Record<string, unknown>
    );
  }, 'fetching followers-gained leaderboard');
};

/**
 * Fetches the largest-outflows leaderboard from the back. Vaults sorted by
 * most negative net flow over the window; empty when nothing qualifies.
 */
export const fetchOutflowsLeaderboard = async (params: {
  window?: VaultLeaderboardWindow;
  limit?: number;
}): Promise<VaultLeaderboardResponse<OutflowItem>> => {
  return withErrorHandling(async () => {
    return await get<VaultLeaderboardResponse<OutflowItem>>(
      ENDPOINTS.INDEXER_VAULT_LEADERBOARD_OUTFLOWS,
      params as Record<string, unknown>
    );
  }, 'fetching outflows leaderboard');
}; 