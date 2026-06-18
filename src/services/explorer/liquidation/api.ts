import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS } from '@/services/api/constants';
import {
  LiquidationResponse,
  LiquidationsParams,
  LiquidationsDataResponse
} from './types';

/**
 * Construit les query params à partir des paramètres de liquidations
 */
const buildQueryParams = (params: LiquidationsParams): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Récupère les liquidations récentes (fenêtre de 2h par défaut)
 * @param params Paramètres de filtrage et pagination
 * @returns Réponse paginée avec les liquidations récentes
 */
export const fetchRecentLiquidations = async (
  params: LiquidationsParams = {}
): Promise<LiquidationResponse> => {
  return withErrorHandling(async () => {
    const queryString = buildQueryParams(params);
    const response = await get<LiquidationResponse>(
      `${ENDPOINTS.LIQUIDATIONS_RECENT}${queryString}`
    );
    return response;
  }, 'fetching recent liquidations');
};

/**
 * Récupère toutes les données (stats + chart) pour toutes les périodes en UN appel
 * @returns Stats et buckets chart pour 2h, 4h, 8h, 12h, 24h
 */
export const fetchLiquidationsData = async (): Promise<LiquidationsDataResponse> => {
  return withErrorHandling(async () => {
    const response = await get<LiquidationsDataResponse>(
      `${ENDPOINTS.LIQUIDATIONS_DATA}`
    );
    return response;
  }, 'fetching liquidations data');
};
