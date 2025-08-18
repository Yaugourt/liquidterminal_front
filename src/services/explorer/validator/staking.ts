import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS } from '@/services/api/constants';
import { 
  StakingValidationsResponse, 
  FormattedStakingValidation, 
  StakingValidationsParams, 
  StakingValidationsPaginatedResponse, 
  StakingValidation,
  UnstakingQueueParams,
  UnstakingQueuePaginatedResponse,
  UnstakingQueueItem,
  UnstakingStatsResponse
} from './types/staking';
import { 
  buildPaginationParams, 
  formatValidationData, 
  formatUnstakingQueueData,
  buildPaginatedResponse 
} from './utils';

/**
 * Récupère les validations de staking depuis notre backend (version simple - dépréciée)
 * @returns Liste des validations de staking formatées
 */
export const fetchStakingValidations = async (): Promise<FormattedStakingValidation[]> => {
  return withErrorHandling(async () => {
    const result = await get<StakingValidationsResponse>(ENDPOINTS.STAKING_VALIDATIONS);
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from staking validations API');
    }

    return result.data.map(formatValidationData);
  }, 'fetching staking validations');
};

/**
 * Récupère les validations de staking avec pagination depuis notre backend
 * @param params Paramètres de pagination (page et limit uniquement)
 * @returns Réponse paginée avec les validations de staking formatées
 */
export const fetchStakingValidationsPaginated = async (params: StakingValidationsParams = {}): Promise<StakingValidationsPaginatedResponse> => {
  return withErrorHandling(async () => {
    const queryString = buildPaginationParams(params);
    const url = `${ENDPOINTS.STAKING_VALIDATIONS}${queryString ? `?${queryString}` : ''}`;
    
    const result = await get<{
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
    }>(url);
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from staking validations API');
    }

    const formattedData = result.data.map(formatValidationData);

    return buildPaginatedResponse(
      formattedData,
      result.pagination,
      (data) => data.reduce((sum, validation) => sum + validation.amount, 0)
    );
  }, 'fetching paginated staking validations');
};

/**
 * Récupère la queue d'unstaking avec pagination depuis notre backend
 * @param params Paramètres de pagination (page et limit uniquement)
 * @returns Réponse paginée avec la queue d'unstaking formatée
 */
export const fetchUnstakingQueuePaginated = async (params: UnstakingQueueParams = {}): Promise<UnstakingQueuePaginatedResponse> => {
  return withErrorHandling(async () => {
    const queryString = buildPaginationParams(params);
    const url = `${ENDPOINTS.STAKING_UNSTAKING_QUEUE}${queryString ? `?${queryString}` : ''}`;
    
    const result = await get<{
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
    }>(url);
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response format from unstaking queue API');
    }

    const formattedData = result.data.map(formatUnstakingQueueData);

    return buildPaginatedResponse(
      formattedData,
      result.pagination,
      (data) => data.reduce((sum, item) => sum + item.amount, 0)
    );
  }, 'fetching paginated unstaking queue');
};

/**
 * Récupère les statistiques d'unstaking par jour
 * @returns Les statistiques d'unstaking avec données quotidiennes
 */
export const fetchUnstakingStats = async (): Promise<UnstakingStatsResponse> => {
  return withErrorHandling(async () => {
    const response = await get<UnstakingStatsResponse>(`${ENDPOINTS.STAKING_UNSTAKING_QUEUE}/stats`);
    return response;
  }, 'fetching unstaking stats');
}; 