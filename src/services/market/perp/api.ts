import { PerpMarketData, PerpGlobalStats } from './types';
import { fetchPaginated, fetchWithConfig } from '../../api/base';
import { PaginatedResponse } from '../../dashboard/types';

export async function fetchPerpMarkets(params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}): Promise<PaginatedResponse<PerpMarketData>> {
  return fetchPaginated<PerpMarketData>('/market/perp', params);
} 

/**
 * Récupère les statistiques globales du marché perp
 */
export const fetchPerpGlobalStats = async (): Promise<PerpGlobalStats> => {
  return fetchWithConfig<PerpGlobalStats>('/market/perp/globalstats');
}; 