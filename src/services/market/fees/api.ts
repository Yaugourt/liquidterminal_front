import { FeesStats, FeesHistoryEntry, FeesStatsApiResponse, FeesHistoryEntryApiResponse } from './types';
import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';

/**
 * Récupère les statistiques de frais du marché
 */
export const getFeesStats = async (): Promise<FeesStats> => {
  return withErrorHandling(async () => {
    // Récupérer la réponse brute de l'API
    const response = await get<FeesStatsApiResponse>('/market/fees');
    
    // Adaptation de la réponse à notre interface FeesStats
    // Cas 1: Les données sont dans response.data
    if (response && response.data && typeof response.data === 'object') {
      return {
        hourlyFees: Number(response.data.hourlyFees || 0),
        dailyFees: Number(response.data.dailyFees || 0),
        hourlySpotFees: Number(response.data.hourlySpotFees || 0),
        dailySpotFees: Number(response.data.dailySpotFees || 0)
      };
    }
    
    // Cas 2: Les données sont directement dans la réponse
    if (response && typeof response === 'object') {
      return {
        hourlyFees: Number(response.hourlyFees || 0),
        dailyFees: Number(response.dailyFees || 0),
        hourlySpotFees: Number(response.hourlySpotFees || 0),
        dailySpotFees: Number(response.dailySpotFees || 0)
      };
    }
    
    // Cas par défaut: retourner des valeurs par défaut
            // Silent error handling
    return {
      hourlyFees: 0,
      dailyFees: 0,
      hourlySpotFees: 0,
      dailySpotFees: 0
    };
  }, 'fetching fees stats');
};

/**
 * Récupère l'historique des frais du marché
 */
export const getFeesHistory = async (): Promise<FeesHistoryEntry[]> => {
  return withErrorHandling(async () => {
    const response = await get<FeesHistoryEntryApiResponse[] | { data: FeesHistoryEntryApiResponse[] }>('/market/fees/raw');
    
    // Cas 1: Les données sont dans response.data
    if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      return response.data.map((entry: FeesHistoryEntryApiResponse) => ({
        time: String(entry.time),
        total_fees: Number(entry.total_fees || 0),
        total_spot_fees: Number(entry.total_spot_fees || 0)
      }));
    }
    
    // Cas 2: Les données sont directement dans la réponse
    if (response && Array.isArray(response)) {
      return response.map((entry: FeesHistoryEntryApiResponse) => ({
        time: String(entry.time),
        total_fees: Number(entry.total_fees || 0),
        total_spot_fees: Number(entry.total_spot_fees || 0)
      }));
    }
    
    // Cas par défaut: retourner un tableau vide
            // Silent error handling
    return [];
  }, 'fetching fees history');
}; 