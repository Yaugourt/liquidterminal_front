import { 
  DelegatorHistoryRequest, 
  DelegatorHistoryResponse, 
  DelegatorRewardsRequest, 
  DelegatorRewardsResponse, 
  DelegatorSummaryRequest, 
  DelegatorSummaryResponse 
} from './types/delegator';
import { callHyperliquidApi } from './utils';

/**
 * Récupère l'historique des délégations d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns L'historique des délégations de l'utilisateur
 */
export const fetchDelegatorHistory = async (
  params: DelegatorHistoryRequest
): Promise<DelegatorHistoryResponse> => {
  return callHyperliquidApi<DelegatorHistoryResponse>(params, 'fetching delegator history');
};

/**
 * Récupère les récompenses des délégations d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns Les récompenses des délégations de l'utilisateur
 */
export const fetchDelegatorRewards = async (
  params: DelegatorRewardsRequest
): Promise<DelegatorRewardsResponse> => {
  return callHyperliquidApi<DelegatorRewardsResponse>(params, 'fetching delegator rewards');
};

/**
 * Récupère le résumé des délégations d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns Le résumé des délégations de l'utilisateur
 */
export const fetchDelegatorSummary = async (
  params: DelegatorSummaryRequest
): Promise<DelegatorSummaryResponse> => {
  return callHyperliquidApi<DelegatorSummaryResponse>(params, 'fetching delegator summary');
}; 