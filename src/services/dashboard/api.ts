import { DashboardGlobalStats, TrendingValidator, BridgeData, AuctionsResponse } from './types';
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
export const fetchLatestAuctions = async (limit: number = 5): Promise<AuctionsResponse> => {
  const response = await fetchWithConfig<AuctionsResponse>('/market/auction');
  
  // Sort and limit both USDC and HYPE auctions
  response.data.usdcAuctions = response.data.usdcAuctions
    .sort((a, b) => b.time - a.time)
    .slice(0, limit);
  
  response.data.hypeAuctions = response.data.hypeAuctions
    .sort((a, b) => b.time - a.time)
    .slice(0, limit);
  
  return response;
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
