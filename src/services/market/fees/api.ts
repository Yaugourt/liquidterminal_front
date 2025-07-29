import { FeesStats, FeesHistoryEntry, FeesStatsResponse, FeesHistoryEntryResponse, FeesHistoryResponse } from './types';
import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';

/**
 * Récupère les statistiques de frais du marché
 */
export const getFeesStats = async (): Promise<FeesStats> => {
  return withErrorHandling(async () => {
    // Récupérer la réponse brute de l'API
    const response = await get<FeesStatsResponse>('/market/fees');
    
    // Adaptation de la réponse à notre interface FeesStats
    return {
      data: {
        hourlyFees: Number(response.data?.hourlyFees || 0),
        dailyFees: Number(response.data?.dailyFees || 0),
        hourlySpotFees: Number(response.data?.hourlySpotFees || 0),
        dailySpotFees: Number(response.data?.dailySpotFees || 0)
      },
      hourlyFees: Number(response.hourlyFees || 0),
      dailyFees: Number(response.dailyFees || 0),
      hourlySpotFees: Number(response.hourlySpotFees || 0),
      dailySpotFees: Number(response.dailySpotFees || 0)
    };
  }, 'getFeesStats');
};

/**
 * Récupère l'historique des frais du marché
 */
export const getFeesHistory = async (): Promise<FeesHistoryEntry[]> => {
  return withErrorHandling(async () => {
    const response = await get<unknown>('/market/fees/raw');
    
    // Cas 1: Les données sont dans response.data
    if (response && typeof response === 'object' && response !== null && 'data' in response && Array.isArray((response as { data: unknown }).data)) {
      return (response as { data: FeesHistoryEntryResponse[] }).data.map((entry) => ({
        time: String(entry.time),
        total_fees: Number(entry.total_fees || 0),
        total_spot_fees: Number(entry.total_spot_fees || 0)
      }));
    }
    
    // Cas 2: Les données sont directement dans la réponse
    if (response && Array.isArray(response)) {
      return response.map((entry: FeesHistoryEntryResponse) => ({
        time: String(entry.time),
        total_fees: Number(entry.total_fees || 0),
        total_spot_fees: Number(entry.total_spot_fees || 0)
      }));
    }
    
    return [];
  }, 'getFeesHistory');
}; 