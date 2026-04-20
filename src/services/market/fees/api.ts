import { FeesStats, FeesHistoryEntry, FeesStatsApiResponse, FeesHistoryEntryApiResponse } from './types';
import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';

/**
 * Récupère les statistiques de frais du marché
 */
export const getFeesStats = async (): Promise<FeesStats> => {
  return withErrorHandling(async () => {
    const response = await get<FeesStatsApiResponse>('/market/fees');
    const data = response?.data;
    return {
      hourlyFees: Number(data?.hourlyFees || 0),
      dailyFees: Number(data?.dailyFees || 0),
      hourlySpotFees: Number(data?.hourlySpotFees || 0),
      dailySpotFees: Number(data?.dailySpotFees || 0)
    };
  }, 'fetching fees stats');
};

/**
 * Récupère l'historique des frais du marché
 */
export const getFeesHistory = async (): Promise<FeesHistoryEntry[]> => {
  return withErrorHandling(async () => {
    const response = await get<{ data: FeesHistoryEntryApiResponse[] }>('/market/fees/raw');
    const entries = response?.data ?? [];
    return entries.map((entry: FeesHistoryEntryApiResponse) => ({
      time: String(entry.time),
      total_fees: Number(entry.total_fees || 0),
      total_spot_fees: Number(entry.total_spot_fees || 0)
    }));
  }, 'fetching fees history');
}; 