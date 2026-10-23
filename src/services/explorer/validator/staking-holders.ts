import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS } from '@/services/api/constants';
import { HoldersStatsResponse } from './types/holders';

/**
 * Récupère les statistiques des holders de HYPE staké
 */
export const fetchHoldersStats = async (): Promise<HoldersStatsResponse> => {
  return withErrorHandling(async () => {
    return await get<HoldersStatsResponse>(ENDPOINTS.STAKING_HOLDERS_STATS);
  }, 'fetching holders stats');
};
 