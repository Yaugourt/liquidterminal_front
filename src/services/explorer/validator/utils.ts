import { postExternal } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { API_URLS } from '@/services/api/constants';
import { StakingValidation, FormattedStakingValidation, UnstakingQueueItem, FormattedUnstakingQueueItem } from './types';

/**
 * Gère les erreurs de façon standardisée (legacy - deprecated)
 * @deprecated Use withErrorHandling from error-handler instead
 */
export const handleApiError = (error: unknown, context: string) => {

  
  if (error && typeof error === 'object' && 'response' in error && error.response) {
    const response = error.response as { status: number; data: { message?: string } };
    throw {
      message: response.data.message || `Failed to ${context}`,
      response: {
        status: response.status,
        data: response.data
      }
    };
  }
  
  throw error;
};

/**
 * Effectue un appel POST vers l'API Hyperliquid
 */
export const callHyperliquidApi = async <T>(params: Record<string, unknown>, context: string): Promise<T> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.HYPERLIQUID_API}/info`;
    return await postExternal<T>(url, params);
  }, context);
};

/**
 * Construit les paramètres de pagination pour les requêtes
 */
export const buildPaginationParams = (params: { page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString());
  }
  
  if (params.limit !== undefined) {
    queryParams.append('limit', params.limit.toString());
  }
  
  return queryParams.toString();
};

/**
 * Formate les données de validation de staking
 */
export const formatValidationData = (validation: StakingValidation): FormattedStakingValidation => {
  return {
    time: new Date(validation.time).toLocaleString(),
    timestamp: new Date(validation.time).getTime(),
    user: validation.user,
    type: validation.type,
    amount: validation.amount,
    validator: validation.validator,
    hash: validation.hash
  };
};

/**
 * Formate les données de la queue d'unstaking
 */
export const formatUnstakingQueueData = (item: UnstakingQueueItem): FormattedUnstakingQueueItem => {
  return {
    time: new Date(item.time).toLocaleString(),
    timestamp: new Date(item.time).getTime(),
    user: item.user,
    amount: item.amount
  };
};

/**
 * Construit une réponse paginée standardisée
 */
export const buildPaginatedResponse = <T>(
  data: T[],
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  },
  calculateTotalVolume: (data: T[]) => number
) => {
  return {
    data,
    pagination: {
      total: pagination.totalItems,
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      totalPages: pagination.totalPages,
      totalVolume: calculateTotalVolume(data),
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage,
    }
  };
}; 