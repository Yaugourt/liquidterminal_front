import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { TopTradersResponse, TopTradersParams } from './types';

/**
 * Récupère le classement des top traders sur les dernières 24h
 * @param params - Paramètres de requête (sort, limit)
 * @returns Liste des top traders avec métadonnées
 */
export const fetchTopTraders = async (params?: TopTradersParams): Promise<TopTradersResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();

    if (params) {
      // Sort: type de classement (pnl_pos, pnl_neg, volume, trades)
      if (params.sort) {
        queryParams.append('sort', params.sort);
      }

      // Limit: nombre de traders (1-50)
      if (params.limit !== undefined && params.limit !== null) {
        queryParams.append('limit', params.limit.toString());
      }
    }

    const endpoint = `/top-traders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<TopTradersResponse>(endpoint);
  }, 'fetching top traders');
};
