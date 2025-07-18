import { get } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { ENDPOINTS } from '../api/constants';
import { 
  StakedHoldersResponse,
  TopHoldersResponse,
  HoldersStatsResponse,
  HolderResponse,
  HoldersParams,
  TopHoldersParams 
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
 * Récupère les top holders de HYPE staké
 */
export const fetchTopHolders = async (params?: TopHoldersParams): Promise<TopHoldersResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    const endpoint = `${ENDPOINTS.STAKING_HOLDERS_TOP}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await get<TopHoldersResponse>(endpoint);
  }, 'fetching top staking holders');
};

/**
 * Récupère les statistiques des holders de HYPE staké
 */
export const fetchHoldersStats = async (): Promise<HoldersStatsResponse> => {
  return withErrorHandling(async () => {
    return await get<HoldersStatsResponse>(ENDPOINTS.STAKING_HOLDERS_STATS);
  }, 'fetching holders stats');
};

/**
 * Récupère un holder spécifique par son adresse
 */
export const fetchHolderByAddress = async (address: string): Promise<HolderResponse> => {
  return withErrorHandling(async () => {
    if (!address) {
      throw new Error('Address is required');
    }
    
    const endpoint = `${ENDPOINTS.STAKING_HOLDERS}/${address}`;
    return await get<HolderResponse>(endpoint);
  }, 'fetching holder by address');
}; 