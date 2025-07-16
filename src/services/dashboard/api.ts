import { DashboardGlobalStats, BridgeData } from './index';
import { get, getExternal } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { API_URLS } from '../api/constants';

/**
 * Récupère les statistiques globales pour le dashboard
 */
export const fetchDashboardGlobalStats = async (): Promise<DashboardGlobalStats> => {
  return withErrorHandling(async () => {
    return await get<DashboardGlobalStats>('/home/globalstats');
  }, 'fetching dashboard global stats');
};

/**
 * Récupère les données TVL du bridge Hyperliquid
 */
export const fetchHLBridge = async (): Promise<BridgeData> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.LLAMA_FI_API}/protocol/hyperliquid-bridge`;
    return await getExternal<BridgeData>(url);
  }, 'fetching HL bridge data');
};