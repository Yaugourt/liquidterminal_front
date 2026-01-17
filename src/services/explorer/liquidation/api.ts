import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS } from '@/services/api/constants';
import { 
  LiquidationResponse, 
  LiquidationsParams, 
  LiquidationStatsAllResponse,
  LiquidationChartDataResponse,
  LiquidationsDataResponse,
  ChartPeriod
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
 * @deprecated Utiliser fetchLiquidationsData à la place
 * Récupère les statistiques de toutes les périodes en un seul appel
 */
export const fetchAllLiquidationStats = async (): Promise<LiquidationStatsAllResponse> => {
  return withErrorHandling(async () => {
    const response = await get<LiquidationStatsAllResponse>(
      `${ENDPOINTS.LIQUIDATIONS_STATS_ALL}`
    );
    return response;
  }, 'fetching all liquidation stats');
};

/**
 * @deprecated Utiliser fetchLiquidationsData à la place
 * Récupère les données agrégées pour le chart
 */
export const fetchLiquidationsChartData = async (
  period: ChartPeriod = "24h"
): Promise<LiquidationChartDataResponse> => {
  return withErrorHandling(async () => {
    const response = await get<LiquidationChartDataResponse>(
      `${ENDPOINTS.LIQUIDATIONS_CHART_DATA}?period=${period}`
    );
    return response;
  }, 'fetching liquidations chart data');
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
