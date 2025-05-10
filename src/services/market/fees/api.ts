import { FeesStats } from './types';
import { fetchWithConfig } from '../../api/base'; // Assuming base fetch utility



/**
 * Fetches the fees statistics.
 */
export const fetchFeesStats = async (): Promise<FeesStats> => {
  // Récupérer la réponse brute de l'API
  const response = await fetchWithConfig<any>('/market/fees');
  
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
  console.error('Unexpected API response structure:', response);
  return {
    hourlyFees: 0,
    dailyFees: 0,
    hourlySpotFees: 0,
    dailySpotFees: 0
  };
}; 