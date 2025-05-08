import { DashboardGlobalStats, TrendingValidator, AuctionInfo, HLBridgeData } from './types';
import { fetchWithConfig } from '../api/base';

/**
 * Récupère les statistiques globales pour le dashboard
 */
export const fetchDashboardGlobalStats = async (): Promise<DashboardGlobalStats> => {
  return fetchWithConfig<DashboardGlobalStats>('/home/globalstats');
};

/**

 * Récupère les validateurs tendance
 */
export const fetchTrendingValidators = async (sortBy: 'stake' | 'apr' = 'stake'): Promise<TrendingValidator[]> => {
  const response = await fetchWithConfig<{ data: TrendingValidator[] }>(
    `/staking/validators/trending?sortBy=${sortBy}`
  );
  return response.data;
};

/**
 * Récupère les dernières enchères
 */
export const fetchLatestAuctions = async (limit: number = 5): Promise<AuctionInfo[]> => {
  const response = await fetchWithConfig<AuctionInfo[]>('/market/auction');
  return response
    .sort((a, b) => b.time - a.time)
    .slice(0, limit);
};


/**
 * Récupère les données TVL du bridge Hyperliquid
 */
export const fetchHLBridge = async (): Promise<HLBridgeData> => {
  const response = await fetch('https://api.llama.fi/protocol/hyperliquid-bridge');
  if (!response.ok) {
    throw new Error('Failed to fetch Hyperliquid bridge data');
  }
  return response.json();
};
