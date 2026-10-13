import { SpotGlobalStats, SpotToken, TokenHoldersPage, TokensWithoutPairsResponse } from './types';
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
 * The spot token whose name matches (case-insensitively), or null when no
 * listed pair has it as base. Throws when the list can't be read: a failed
 * read is not "not found".
 */
export const getToken = async (tokenName: string): Promise<SpotToken | null> => {
  const response = await fetchSpotTokens({ limit: 1000 });
  return response.data.find(t => t.name.toLowerCase() === tokenName.toLowerCase()) ?? null;
};

/**
 * Names of the spot tokens deployed on HyperCore that no pair trades yet
 * (e.g. a deploy auction's winner before its pair is listed). ~1.5 KB.
 */
export const fetchTokensWithoutPairs = async (): Promise<string[]> => {
  return withErrorHandling(async () => {
    const response = await get<TokensWithoutPairsResponse>('/market/spot/tokens-without-pairs');
    return response.data;
  }, 'fetching tokens without pairs');
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
