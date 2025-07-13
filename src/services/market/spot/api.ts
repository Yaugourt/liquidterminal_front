import { SpotGlobalStats, SpotToken } from './types';
import { fetchWithConfig, fetchPaginated } from '../../api/base';
import { PaginatedResponse } from '../../common';

/**
 * Récupère les statistiques globales du marché spot
 */
export const fetchSpotGlobalStats = async (): Promise<SpotGlobalStats> => {
  return fetchWithConfig<SpotGlobalStats>('/market/spot/globalstats');
};

export async function fetchSpotTokens(params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}): Promise<PaginatedResponse<SpotToken>> {
  return fetchPaginated<SpotToken>('/market/spot', params);
}

/**
 * Récupère un token spécifique par son nom
 */
export const getToken = async (tokenName: string): Promise<SpotToken | null> => {
  try {
    // Récupère tous les tokens et trouve celui qui correspond au nom
    const response = await fetchSpotTokens({ limit: 1000 });
    const token = response.data.find(t => t.name.toLowerCase() === tokenName.toLowerCase());
    return token || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
}; 