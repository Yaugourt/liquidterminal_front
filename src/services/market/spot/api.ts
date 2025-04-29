import { SpotGlobalStats, SpotToken } from './types';
import { fetchWithConfig, fetchPaginated } from '../../api/base';
import { PaginatedResponse } from '../../dashboard/types';

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