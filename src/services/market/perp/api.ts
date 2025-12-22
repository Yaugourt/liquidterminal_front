import { PerpMarketData, PerpGlobalStats, PerpMarketParams } from './types';
import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { PaginatedResponse, buildQueryParams } from '../../common';

export async function fetchPerpMarkets(params: PerpMarketParams): Promise<PaginatedResponse<PerpMarketData>> {
  return withErrorHandling(async () => {
    const queryParams = buildQueryParams(params);
    const url = `/market/perp?${queryParams.toString()}`;
    return await get<PaginatedResponse<PerpMarketData>>(url);
  }, 'fetching perp markets');
}

/**
 * Récupère les statistiques globales du marché perp
 */
export const fetchPerpGlobalStats = async (): Promise<PerpGlobalStats> => {
  return withErrorHandling(async () => {
    return await get<PerpGlobalStats>('/market/perp/globalstats');
  }, 'fetching perp global stats');
}; 