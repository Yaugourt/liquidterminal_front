import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS } from '@/services/api/constants';
import {
  LiquidationResponse,
  LiquidationsParams,
  LiquidationsDataResponse,
  HistoricalChartPeriod,
  HistoricalChartResponse
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
  params: LiquidationsParams = {},
  signal?: AbortSignal
): Promise<LiquidationResponse> => {
  return withErrorHandling(async () => {
    const queryString = buildQueryParams(params);
    const response = await get<LiquidationResponse>(
      `${ENDPOINTS.LIQUIDATIONS_RECENT}${queryString}`,
      undefined,
      { signal }
    );
    return response;
  }, 'fetching recent liquidations');
};

/**
 * Every liquidation recorded against one wallet (as `liquidated_user`), newest
 * first, from the local DB's unified `/liquidations` endpoint. The upstream
 * emits two rows per event (priced + liquidators), so callers fold them with
 * `mergeLiquidationRows` before counting.
 * @param address Wallet address
 * @param limit Max rows (1-1000, default 100)
 */
export const fetchUserLiquidations = async (
  address: string,
  limit = 100
): Promise<LiquidationResponse> => {
  return withErrorHandling(async () => {
    const queryString = buildQueryParams({ user: address, limit, order: 'DESC' });
    return await get<LiquidationResponse>(`${ENDPOINTS.LIQUIDATIONS}${queryString}`);
  }, 'fetching user liquidations');
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

/**
 * Fetches historical liquidation chart buckets from the local DB endpoint
 * (the robust source - see CLAUDE.md data source reliability)
 * @param period Aggregation window (24h, 7d, 14d, 30d, 90d)
 * @returns Bucketed volumes/counts plus filters and metadata
 */
export const fetchLiquidationsHistoricalChart = async (
  period: HistoricalChartPeriod
): Promise<HistoricalChartResponse> => {
  return withErrorHandling(async () => {
    const response = await get<HistoricalChartResponse>(
      `${ENDPOINTS.LIQUIDATIONS_HISTORICAL_CHART}?period=${period}`
    );
    return response;
  }, 'fetching liquidations historical chart');
};
