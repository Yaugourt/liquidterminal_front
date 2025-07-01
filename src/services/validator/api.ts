import { fetchWithConfig, fetchExternal, buildHyperliquidUrl, ENDPOINTS } from '../api/base';
import { ValidatorDelegationsRequest, ValidatorDelegationsResponse, Validator } from './types';

/**
 * Récupère les délégations de staking d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns Les délégations de staking de l'utilisateur
 */
export const fetchValidatorDelegations = async (
  params: ValidatorDelegationsRequest
): Promise<ValidatorDelegationsResponse> => {
  try {
    const url = buildHyperliquidUrl('HYPERLIQUID_INFO');
    const response = await fetchExternal<ValidatorDelegationsResponse>(url, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response;
  } catch (error: any) {
    console.error('Error fetching validator delegations:', error);
    
    if (error.response) {
      // Propager l'erreur avec le statut HTTP et le message
      throw {
        message: error.response.data.message || 'Failed to fetch validator delegations',
        response: {
          status: error.response.status,
          data: error.response.data
        }
      };
    }
    
    throw error;
  }
};

/**
 * Récupère tous les validateurs
 */
export const fetchAllValidators = async (): Promise<Validator[]> => {
  try {
    const response = await fetchWithConfig<{ data: Validator[] }>(
      ENDPOINTS.STAKING_VALIDATORS
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching all validators:', error);
    
    if (error.response) {
      throw {
        message: error.response.data.message || 'Failed to fetch validators',
        response: {
          status: error.response.status,
          data: error.response.data
        }
      };
    }
    
    throw error;
  }
};

/**
 * Récupère les validateurs tendance (triés)
 */
export const fetchTrendingValidators = async (sortBy: 'stake' | 'apr' = 'stake'): Promise<Validator[]> => {
  try {
    const response = await fetchWithConfig<{ data: Validator[] }>(
      `${ENDPOINTS.STAKING_VALIDATORS_TRENDING}?sortBy=${sortBy}`
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching trending validators:', error);
    
    if (error.response) {
      throw {
        message: error.response.data.message || 'Failed to fetch trending validators',
        response: {
          status: error.response.status,
          data: error.response.data
        }
      };
    }
    
    throw error;
  }
}; 