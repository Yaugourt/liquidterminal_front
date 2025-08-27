import { SpotGlobalStats, SpotToken, TokenHoldersResponse } from './types';
import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { PaginatedResponse } from '../../common';
import { buildHypurrscanUrl } from '../../api/constants';

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
}): Promise<PaginatedResponse<SpotToken>> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder);
    }
    
    const url = `/market/spot${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<PaginatedResponse<SpotToken>>(url);
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
 * Récupère les holders d'un token spécifique
 */
export const fetchTokenHolders = async (tokenName: string): Promise<TokenHoldersResponse> => {
  return withErrorHandling(async () => {
    const url = `${buildHypurrscanUrl('HYPURRSCAN_HOLDERS')}/${tokenName}`;
    return await get<TokenHoldersResponse>(url);
  }, 'fetching token holders');
};

/**
 * Récupère les holders stakés d'un token spécifique
 */
export const fetchStakedHolders = async (tokenName: string): Promise<TokenHoldersResponse> => {
  return withErrorHandling(async () => {
    const url = `${buildHypurrscanUrl('HYPURRSCAN_HOLDERS')}/staked${tokenName}`;
    return await get<TokenHoldersResponse>(url);
  }, 'fetching staked holders');
}; 