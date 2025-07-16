import { get, postExternal } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import { ENDPOINTS, API_URLS } from '../api/constants';
import { 
  VaultDepositsRequest, 
  VaultDepositsResponse,
  VaultSummary,
  VaultsParams,
  VaultsResponse,
  VaultResponse
} from './types';
import { PaginatedResponse } from '../common';

/**
 * Adapts the vault response to match the PaginatedResponse format
 */
const adaptVaultResponse = (response: VaultsResponse): PaginatedResponse<VaultSummary> => {
  return {
    data: response.data,
    pagination: {
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.data.length,
      totalPages: Math.ceil(response.pagination.total / response.data.length),
      totalVolume: response.pagination.totalTvl
    }
  };
};

/**
 * Fetches vaults with pagination and sorting
 */
export const fetchVaults = async (params: VaultsParams): Promise<VaultsResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await get<VaultResponse>(
      `${ENDPOINTS.MARKET_VAULTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );

    return {
      success: true,
      data: response.data,
      pagination: {
        totalTvl: response.pagination.totalTvl,
        total: response.pagination.vaultsNumber,
        page: response.pagination.page
      }
    };
  }, 'fetching vaults');
};

/**
 * Récupère les dépôts de vault d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns Les dépôts de vault de l'utilisateur
 */
export const fetchVaultDeposits = async (
  params: VaultDepositsRequest
): Promise<VaultDepositsResponse> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.HYPERLIQUID_API}/info`;
    return await postExternal<VaultDepositsResponse>(url, params);
  }, 'fetching vault deposits');
}; 