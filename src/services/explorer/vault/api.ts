import { get, postExternal } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { ENDPOINTS, API_URLS } from '@/services/api/constants';
import { 
  VaultDepositsRequest, 
  VaultDepositsResponse,
  VaultsParams,
  VaultsResponse,
  VaultResponse,
  VaultDetailsRequest,
  VaultDetailsResponse
} from './types';

/**
 * Adapts the vault response to match the PaginatedResponse format

/**
 * Fetches vaults with pagination and sorting
 */
export const fetchVaults = async (params: VaultsParams): Promise<VaultsResponse> => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
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
        page: response.pagination.page,
        limit: response.pagination.limit || params.limit || 10,
        totalPages: response.pagination.totalPages || Math.ceil(response.pagination.vaultsNumber / (params.limit || 10)),
        hasNext: response.pagination.page < (response.pagination.totalPages || 1),
        hasPrevious: response.pagination.page > 1
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

/**
 * Récupère les détails d'un vault spécifique pour la chart
 * @param params Les paramètres de la requête avec l'adresse du vault
 * @returns Les détails du vault avec l'historique des données
 */
export const fetchVaultDetails = async (
  params: VaultDetailsRequest
): Promise<VaultDetailsResponse> => {
  return withErrorHandling(async () => {
    const url = `${API_URLS.HYPERLIQUID_API}/info`;
    return await postExternal<VaultDetailsResponse>(url, params);
  }, 'fetching vault details');
}; 