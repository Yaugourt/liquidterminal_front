import { StakingValidationsParams, StakingValidationsPaginatedResponse, UseStakingValidationsOptions, UseStakingValidationsPaginatedResult } from '../../types/staking';
import { fetchStakingValidationsPaginated } from '../../staking';
import { useDataFetching } from '@/hooks/useDataFetching';
import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Hook pour récupérer les validations de staking avec pagination
 */
export const useStakingValidationsPaginated = ({
  limit = 25,
  defaultParams = {},
  initialData
}: UseStakingValidationsOptions = {}): UseStakingValidationsPaginatedResult => {
  const [params, setParams] = useState<StakingValidationsParams>(() => ({
    limit,
    page: defaultParams.page || 1,
    ...defaultParams,
  }));

  // Update params when defaultParams change
  useEffect(() => {
    if (defaultParams.page !== undefined || defaultParams.limit !== undefined) {
      setParams(prev => ({
        ...prev,
        page: defaultParams.page || prev.page,
        limit: defaultParams.limit || limit
      }));
    }
  }, [defaultParams.page, defaultParams.limit, limit]);

  const { 
    data: response, 
    isLoading, 
    error,
    refetch
  } = useDataFetching<StakingValidationsPaginatedResponse>({
    fetchFn: async () => {
  
      const response = await fetchStakingValidationsPaginated(params);
      return response;
    },
    refreshInterval: 30000,
    maxRetries: 3,
    dependencies: [params.page, params.limit], // Utiliser les valeurs primitives
    initialData: initialData ? {
      data: initialData,
      pagination: {
        total: initialData.length,
        page: 1,
        limit: initialData.length,
        totalPages: 1,
        totalVolume: initialData.reduce((sum, validation) => sum + validation.amount, 0),
        hasNext: false,
        hasPrevious: false,
      }
    } : undefined
  });

  const updateParams = useCallback((newParams: Partial<StakingValidationsParams>) => {

    setParams(prev => {
      const updated = { ...prev, ...newParams };
  
      return updated;
    });
  }, []);

  // Memoized results
  const results = useMemo(() => ({
    validations: response?.data || [],
    total: response?.pagination.total || 0,
    page: response?.pagination.page || 1,
    totalPages: response?.pagination.totalPages || 0,
    totalVolume: response?.pagination.totalVolume || 0,
    hasNextPage: response?.pagination.hasNext || false,
    hasPreviousPage: response?.pagination.hasPrevious || false,
    isLoading,
    error,
    updateParams,
    refetch
  }), [response, isLoading, error, updateParams, refetch]);

  return results;
}; 