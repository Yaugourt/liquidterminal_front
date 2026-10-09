import { get } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { SpotUsdcResponse } from './types';

/**
 * Récupère la série des stablecoins on-spot (Hypurrscan `/spotUSDC`, un point
 * par jour) depuis le backend, qui la relit chaque minute et sert sa copie
 * compressée : ~40 KB au lieu des 184 KB non compressés de Hypurrscan.
 * Retourne la série complète — l'appelant lit la dernière entrée.
 */
export const fetchSpotStablecoins = async (): Promise<SpotUsdcResponse> => {
  return withErrorHandling(async () => {
    return await get<SpotUsdcResponse>('/market/stablecoins/history');
  }, 'fetching spot stablecoins');
};
