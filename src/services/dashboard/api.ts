import { DashboardGlobalStats, BridgeData } from './index';
import { fetchWithConfig, fetchExternal, buildLlamaFiUrl, ENDPOINTS } from '../api/base';

/**
 * Récupère les statistiques globales pour le dashboard
 */
export const fetchDashboardGlobalStats = async (): Promise<DashboardGlobalStats> => {
  return fetchWithConfig<DashboardGlobalStats>('/home/globalstats');
};



/**
 * Récupère les données TVL du bridge Hyperliquid
 */
export const fetchHLBridge = async (): Promise<BridgeData> => {
  const url = buildLlamaFiUrl('LLAMA_FI_HYPERLIQUID_BRIDGE');
  return await fetchExternal<BridgeData>(url);
};