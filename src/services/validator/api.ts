import { fetchWithConfig, fetchExternal, buildHyperliquidUrl, ENDPOINTS } from '../api/base';
import { ValidatorDelegationsRequest, ValidatorDelegationsResponse, Validator, StakingValidationsResponse, FormattedStakingValidation, StakingValidationsParams, StakingValidationsPaginatedResponse, StakingValidation, UnstakingQueueParams, UnstakingQueuePaginatedResponse, UnstakingQueueItem, ValidatorStats, DelegatorHistoryRequest, DelegatorHistoryResponse, DelegatorRewardsRequest, DelegatorRewardsResponse, DelegatorSummaryRequest, DelegatorSummaryResponse } from './types';

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
 * Récupère tous les validateurs avec les stats
 */
export const fetchAllValidators = async (): Promise<{ validators: Validator[], stats: ValidatorStats }> => {
  try {
    const response = await fetchWithConfig<{ 
      data: Validator[],
      stats: {
        totalValidators: number;
        activeValidators: number;
        totalHypeStaked: number;
      }
    }>(
      ENDPOINTS.STAKING_VALIDATORS
    );

    const stats: ValidatorStats = {
      total: response.stats.totalValidators,
      active: response.stats.activeValidators,
      inactive: response.stats.totalValidators - response.stats.activeValidators,
      totalHypeStaked: response.stats.totalHypeStaked
    };

    return { validators: response.data, stats };
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

/**
 * Récupère les validations de staking depuis notre backend (version simple - dépréciée)
 * @returns Liste des validations de staking formatées
 */
export const fetchStakingValidations = async (): Promise<FormattedStakingValidation[]> => {
  try {
    const result = await fetchWithConfig<StakingValidationsResponse>(
      ENDPOINTS.STAKING_VALIDATIONS,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from staking validations API');
    }

    // Formater les données pour l'affichage
    return result.data.map(validation => ({
      time: new Date(validation.time).toLocaleString(),
      timestamp: new Date(validation.time).getTime(),
      user: validation.user,
      type: validation.type,
      amount: validation.amount,
      validator: validation.validator,
      hash: validation.hash,
    }));
  } catch (error) {
    console.error('Error fetching staking validations:', error);
    throw error;
  }
};

/**
 * Récupère les validations de staking avec pagination depuis notre backend
 * @param params Paramètres de pagination (page et limit uniquement)
 * @returns Réponse paginée avec les validations de staking formatées
 */
export const fetchStakingValidationsPaginated = async (params: StakingValidationsParams = {}): Promise<StakingValidationsPaginatedResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Ajouter seulement les paramètres de pagination supportés
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `${ENDPOINTS.STAKING_VALIDATIONS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const result = await fetchWithConfig<{
      success: boolean;
      data: StakingValidation[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }>(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from staking validations API');
    }

    // Formater les données pour l'affichage
    const formattedData = result.data.map(validation => ({
      time: new Date(validation.time).toLocaleString(),
      timestamp: new Date(validation.time).getTime(),
      user: validation.user,
      type: validation.type,
      amount: validation.amount,
      validator: validation.validator,
      hash: validation.hash,
    }));

    // Le backend trie déjà par date décroissante, pas besoin de trier côté client

    return {
      data: formattedData,
      pagination: {
        total: result.pagination.totalItems,
        page: result.pagination.currentPage,
        limit: result.pagination.itemsPerPage,
        totalPages: result.pagination.totalPages,
        totalVolume: formattedData.reduce((sum, validation) => sum + validation.amount, 0),
        hasNextPage: result.pagination.hasNextPage,
        hasPreviousPage: result.pagination.hasPreviousPage,
      },
      metadata: {
        lastUpdate: Date.now(),
      }
    };
  } catch (error) {
    console.error('Error fetching paginated staking validations:', error);
    throw error;
  }
};

/**
 * Récupère la queue d'unstaking avec pagination depuis notre backend
 * @param params Paramètres de pagination (page et limit uniquement)
 * @returns Réponse paginée avec la queue d'unstaking formatée
 */
export const fetchUnstakingQueuePaginated = async (params: UnstakingQueueParams = {}): Promise<UnstakingQueuePaginatedResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Ajouter seulement les paramètres de pagination supportés
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `${ENDPOINTS.STAKING_UNSTAKING_QUEUE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const result = await fetchWithConfig<{
      success: boolean;
      data: UnstakingQueueItem[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }>(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from unstaking queue API');
    }

    // Formater les données pour l'affichage
    const formattedData = result.data.map(item => ({
      time: new Date(item.time).toLocaleString(),
      timestamp: new Date(item.time).getTime(),
      user: item.user,
      amount: item.amount,
    }));

    // Le backend trie déjà par date décroissante, pas besoin de trier côté client

    return {
      data: formattedData,
      pagination: {
        total: result.pagination.totalItems,
        page: result.pagination.currentPage,
        limit: result.pagination.itemsPerPage,
        totalPages: result.pagination.totalPages,
        totalVolume: formattedData.reduce((sum, item) => sum + item.amount, 0),
        hasNextPage: result.pagination.hasNextPage,
        hasPreviousPage: result.pagination.hasPreviousPage,
      },
      metadata: {
        lastUpdate: Date.now(),
      }
    };
  } catch (error) {
    console.error('Error fetching paginated unstaking queue:', error);
    throw error;
  }
};

/**
 * Récupère l'historique des délégations d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns L'historique des délégations de l'utilisateur
 */
export const fetchDelegatorHistory = async (
  params: DelegatorHistoryRequest
): Promise<DelegatorHistoryResponse> => {
  try {
    const url = buildHyperliquidUrl('HYPERLIQUID_INFO');
    const response = await fetchExternal<DelegatorHistoryResponse>(url, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response;
  } catch (error: any) {
    console.error('Error fetching delegator history:', error);
    
    if (error.response) {
      // Propager l'erreur avec le statut HTTP et le message
      throw {
        message: error.response.data.message || 'Failed to fetch delegator history',
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
 * Récupère les récompenses des délégations d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns Les récompenses des délégations de l'utilisateur
 */
export const fetchDelegatorRewards = async (
  params: DelegatorRewardsRequest
): Promise<DelegatorRewardsResponse> => {
  try {
    const url = buildHyperliquidUrl('HYPERLIQUID_INFO');
    const response = await fetchExternal<DelegatorRewardsResponse>(url, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response;
  } catch (error: any) {
    console.error('Error fetching delegator rewards:', error);
    
    if (error.response) {
      // Propager l'erreur avec le statut HTTP et le message
      throw {
        message: error.response.data.message || 'Failed to fetch delegator rewards',
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
 * Récupère le résumé des délégations d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns Le résumé des délégations de l'utilisateur
 */
export const fetchDelegatorSummary = async (
  params: DelegatorSummaryRequest
): Promise<DelegatorSummaryResponse> => {
  try {
    const url = buildHyperliquidUrl('HYPERLIQUID_INFO');
    const response = await fetchExternal<DelegatorSummaryResponse>(url, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response;
  } catch (error: any) {
    console.error('Error fetching delegator summary:', error);
    
    if (error.response) {
      // Propager l'erreur avec le statut HTTP et le message
      throw {
        message: error.response.data.message || 'Failed to fetch delegator summary',
        response: {
          status: error.response.status,
          data: error.response.data
        }
      };
    }
    
    throw error;
  }
}; 