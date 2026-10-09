import { SpotGlobalStats, SpotToken, TokenHoldersPage } from './types';
import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { PaginatedResponse, buildQueryParams } from '../../common';

/**
 * Récupère les statistiques globales du marché spot
 */
export const fetchSpotGlobalStats = async (): Promise<SpotGlobalStats> => {
  return withErrorHandling(async () => {
    return await get<SpotGlobalStats>('/market/spot/globalstats');
  }, 'fetching spot global stats');
};

/**
 * Récupère les tokens spot avec pagination
 */

export const fetchSpotTokens = async (params: {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}, signal?: AbortSignal): Promise<PaginatedResponse<SpotToken>> => {
  return withErrorHandling(async () => {
    const queryParams = buildQueryParams(params);
    const url = `/market/spot?${queryParams.toString()}`;
    return await get<PaginatedResponse<SpotToken>>(url, undefined, { signal });
  }, 'fetching spot tokens');
};

/**
 * Récupère un token spécifique par son nom
 */
export const getToken = async (tokenName: string): Promise<SpotToken | null> => {
  try {
    // Récupère tous les tokens et trouve celui qui correspond au nom
    const response = await fetchSpotTokens({ limit: 1000 });
    const token = response.data.find(t => t.name.toLowerCase() === tokenName.toLowerCase());
    return token || null;
  } catch {
    // Silent error handling
    return null;
  }
};

/**
 * One page of a spot token's holders, largest first (spot + staked balances
 * summed per address), with the holder count, summed balance and cohorts of
 * every holder. The backend aggregates Hypurrscan's lists (HYPE's weigh
 * 17.7 MB) so the browser no longer downloads them.
 *
 * @param page starts at 1
 */
export const fetchTokenHolders = async (
  tokenName: string,
  page: number,
  limit: number,
  signal?: AbortSignal
): Promise<TokenHoldersPage> => {
  return withErrorHandling(async () => {
    const response = await get<{ success: boolean; data: TokenHoldersPage }>(
      `/market/holders/${encodeURIComponent(tokenName)}`,
      { page, limit },
      { signal }
    );
    return response.data;
  }, 'fetching token holders');
};
