import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS } from '@/services/api/constants';
import {
  LiquidationResponse,
  LiquidationsParams,
  LiquidationsDataResponse,
  LiquidationsHistoricalChartResponse
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
 * Récupère les liquidations historiques avec filtres et pagination keyset
 * @param params Paramètres de filtrage et pagination
 * @returns Réponse paginée avec les liquidations
 */
export const fetchLiquidations = async (
  params: LiquidationsParams = {}
): Promise<LiquidationResponse> => {
  return withErrorHandling(async () => {
    const queryString = buildQueryParams(params);
    const response = await get<LiquidationResponse>(
      `${ENDPOINTS.LIQUIDATIONS}${queryString}`
    );
    return response;
  }, 'fetching liquidations');
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
 * Récupère la chart historique des liquidations (`/liquidations/historical/chart`).
 * Profondeur jusqu'à 90 jours, granularité adaptative côté backend.
 */
export const fetchLiquidationsHistoricalChart = async (
  period: string = '30d',
  coin?: string
): Promise<LiquidationsHistoricalChartResponse> => {
  return withErrorHandling(async () => {
    const params = new URLSearchParams({ period });
    if (coin) params.append('coin', coin);
    return await get<LiquidationsHistoricalChartResponse>(
      `/liquidations/historical/chart?${params.toString()}`
    );
  }, 'fetching historical liquidations chart');
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
