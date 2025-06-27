import { fetchWithConfig } from '../api/base';
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
    console.log('Fetching validator delegations for user:', params.user);
    
    const response = await fetchWithConfig<ValidatorDelegationsResponse>(
      'https://api.hyperliquid.xyz/info',
      {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Received validator delegations:', response);
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
    console.log('Fetching all validators');
    
    const response = await fetchWithConfig<{ data: Validator[] }>(
      '/staking/validators'
    );

    console.log('Received all validators:', response);
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
    console.log('Fetching trending validators, sortBy:', sortBy);
    
    const response = await fetchWithConfig<{ data: Validator[] }>(
      `/staking/validators/trending?sortBy=${sortBy}`
    );

    console.log('Received trending validators:', response);
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