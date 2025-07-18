import { get } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { ENDPOINTS } from '../api/constants';
import { ValidatorDelegationsRequest, ValidatorDelegationsResponse, Validator, ValidatorStats } from './types/validators';
import { callHyperliquidApi } from './utils';

/**
 * Récupère les délégations de staking d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns Les délégations de staking de l'utilisateur
 */
export const fetchValidatorDelegations = async (
  params: ValidatorDelegationsRequest
): Promise<ValidatorDelegationsResponse> => {
  return callHyperliquidApi<ValidatorDelegationsResponse>(params, 'fetching validator delegations');
};

/**
 * Récupère tous les validateurs avec les stats
 */
export const fetchAllValidators = async (): Promise<{ validators: Validator[], stats: ValidatorStats }> => {
  return withErrorHandling(async () => {
    const response = await get<{ 
      data: Validator[],
      stats: {
        totalValidators: number;
        activeValidators: number;
        totalHypeStaked: number;
      }
    }>(ENDPOINTS.STAKING_VALIDATORS);

    const stats: ValidatorStats = {
      total: response.stats.totalValidators,
      active: response.stats.activeValidators,
      inactive: response.stats.totalValidators - response.stats.activeValidators,
      totalHypeStaked: response.stats.totalHypeStaked
    };

    return { validators: response.data, stats };
  }, 'fetching all validators');
};

/**
 * Récupère les validateurs tendance (triés)
 */
export const fetchTrendingValidators = async (sortBy: 'stake' | 'apr' = 'stake'): Promise<Validator[]> => {
  return withErrorHandling(async () => {
    const response = await get<{ data: Validator[] }>(
      `${ENDPOINTS.STAKING_VALIDATORS_TRENDING}?sortBy=${sortBy}`
    );

    return response.data;
  }, 'fetching trending validators');
}; 