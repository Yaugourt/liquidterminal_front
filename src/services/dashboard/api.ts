import { DashboardGlobalStats, BridgeData } from './index';
import { fetchWithConfig } from '../api/base';

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
  const response = await fetch('https://api.llama.fi/protocol/hyperliquid-bridge');
  if (!response.ok) {
    throw new Error('Failed to fetch Hyperliquid bridge data');
  }
  return response.json();
};
