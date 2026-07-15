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
 * Find a single perp market by coin name (e.g. "BTC"). The backend has no
 * single-market endpoint, so the full directory is fetched once and searched.
 */
export const getPerpMarket = async (coinName: string): Promise<PerpMarketData | null> => {
  try {
    const response = await fetchPerpMarkets({ limit: 1000, page: 1 });
    return (
      response.data.find((m) => m.name.toLowerCase() === coinName.toLowerCase()) ?? null
    );
  } catch {
    // Silent error handling: the caller falls back to placeholder values
    return null;
  }
};

/**
 * Récupère les statistiques globales du marché perp
 */
export const fetchPerpGlobalStats = async (): Promise<PerpGlobalStats> => {
  return withErrorHandling(async () => {
    return await get<PerpGlobalStats>('/market/perp/globalstats');
  }, 'fetching perp global stats');
}; 