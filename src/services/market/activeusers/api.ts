import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { ActiveUsersResponse, ActiveUsersParams } from './types';

/**
 * Récupère les utilisateurs les plus actifs sur une période donnée
 * @param params - Paramètres de requête (hours, limit)
 * @returns Liste des utilisateurs actifs avec métadonnées
 */
export const fetchActiveUsers = async (params?: ActiveUsersParams): Promise<ActiveUsersResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();

    if (params) {
      // Hours: fenêtre temporelle (1-168)
      if (params.hours !== undefined && params.hours !== null) {
        queryParams.append('hours', params.hours.toString());
      }

      // Limit: nombre d'utilisateurs (1-100)
      if (params.limit !== undefined && params.limit !== null) {
        queryParams.append('limit', params.limit.toString());
      }
    }

    const endpoint = `/active-users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<ActiveUsersResponse>(endpoint);
  }, 'fetching active users');
};
