import { getExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import { SpotUsdcResponse } from './types';

/**
 * Récupère la série des stablecoins on-spot depuis Hypurrscan (`/spotUSDC`).
 * Retourne la série complète — l'appelant lit la dernière entrée.
 */
export const fetchSpotStablecoins = async (): Promise<SpotUsdcResponse> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.HYPURRSCAN_API}/spotUSDC`;
    return await getExternal<SpotUsdcResponse>(url);
  }, 'fetching spot stablecoins');
};
