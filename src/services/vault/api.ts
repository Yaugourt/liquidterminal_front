import { fetchWithConfig, fetchExternal, buildHyperliquidUrl, ENDPOINTS } from '../api/base';
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
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetchWithConfig<VaultResponse>(
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
};

/**
 * Récupère les dépôts de vault d'un utilisateur
 * @param params Les paramètres de la requête
 * @returns Les dépôts de vault de l'utilisateur
 */
export const fetchVaultDeposits = async (
  params: VaultDepositsRequest
): Promise<VaultDepositsResponse> => {
  try {
  
    
    const url = buildHyperliquidUrl('HYPERLIQUID_INFO');
    const response = await fetchExternal<VaultDepositsResponse>(url, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    });


    return response;
  } catch (error: any) {
    console.error('Error fetching vault deposits:', error);
    
    if (error.response) {
      // Propager l'erreur avec le statut HTTP et le message
      throw {
        message: error.response.data.message || 'Failed to fetch vault deposits',
        response: {
          status: error.response.status,
          data: error.response.data
        }
      };
    }
    
    throw error;
  }
}; 