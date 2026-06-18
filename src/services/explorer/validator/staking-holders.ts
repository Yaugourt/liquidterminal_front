import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS } from '@/services/api/constants';
import {
  StakedHoldersResponse,
  HoldersStatsResponse,
  HoldersParams
} from './types/holders';

/**
 * Récupère la liste paginée des holders de HYPE staké
 */
export const fetchStakingHolders = async (params?: HoldersParams): Promise<StakedHoldersResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `${ENDPOINTS.STAKING_HOLDERS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<StakedHoldersResponse>(endpoint);
  }, 'fetching staking holders');
};

/**
 * Récupère les statistiques des holders de HYPE staké
 */
export const fetchHoldersStats = async (): Promise<HoldersStatsResponse> => {
  return withErrorHandling(async () => {
    return await get<HoldersStatsResponse>(ENDPOINTS.STAKING_HOLDERS_STATS);
  }, 'fetching holders stats');
};
 