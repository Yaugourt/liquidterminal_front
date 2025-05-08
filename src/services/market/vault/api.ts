import { VaultSummary, VaultsParams, VaultsResponse } from './types';
import { fetchWithConfig } from '../../api/base';
import { PaginatedResponse } from '../../dashboard/types';

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
export async function fetchVaults(params: VaultsParams): Promise<PaginatedResponse<VaultSummary>> {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetchWithConfig<VaultsResponse>(
    `/market/vaults${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  );
  
  return adaptVaultResponse(response);
} 