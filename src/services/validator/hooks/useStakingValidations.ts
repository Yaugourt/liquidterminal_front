import { FormattedStakingValidation, UseStakingValidationsResult, StakingValidationsParams, StakingValidationsPaginatedResponse, UseStakingValidationsOptions, UseStakingValidationsPaginatedResult, UnstakingQueueParams, UnstakingQueuePaginatedResponse, UseUnstakingQueueOptions, UseUnstakingQueuePaginatedResult } from '../types';
import { fetchStakingValidations, fetchStakingValidationsPaginated, fetchUnstakingQueuePaginated } from '../api';
import { useDataFetching } from '@/hooks/useDataFetching';
import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Hook pour récupérer et formater les validations de staking (version simple - dépréciée)
 */
export const useStakingValidations = (): UseStakingValidationsResult => {
  const { data, isLoading, error } = useDataFetching<FormattedStakingValidation[]>({
    fetchFn: async () => {
      const validations = await fetchStakingValidations();
      
      // Trier par timestamp décroissant (plus récent en premier)
      return validations.sort((a, b) => b.timestamp - a.timestamp);
    },
    dependencies: [],
    refreshInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  return {
    validations: data,
    isLoading,
    error
  };
};

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
      console.log('Fetching staking validations with params:', params);
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
        hasNextPage: false,
        hasPreviousPage: false,
      }
    } : undefined
  });

  const updateParams = useCallback((newParams: Partial<StakingValidationsParams>) => {
    console.log('Updating staking params:', newParams);
    setParams(prev => {
      const updated = { ...prev, ...newParams };
      console.log('Updated staking params:', updated);
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
    hasNextPage: response?.pagination.hasNextPage || false,
    hasPreviousPage: response?.pagination.hasPreviousPage || false,
    isLoading,
    error,
    updateParams,
    refetch
  }), [response, isLoading, error, updateParams, refetch]);

  return results;
};

/**
 * Hook pour récupérer la queue d'unstaking avec pagination
 */
export const useUnstakingQueuePaginated = ({
  limit = 25,
  defaultParams = {},
  initialData
}: UseUnstakingQueueOptions = {}): UseUnstakingQueuePaginatedResult => {
  const [params, setParams] = useState<UnstakingQueueParams>(() => ({
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
  } = useDataFetching<UnstakingQueuePaginatedResponse>({
    fetchFn: async () => {
      console.log('Fetching unstaking queue with params:', params);
      const response = await fetchUnstakingQueuePaginated(params);
      return response;
    },
    refreshInterval: 10000, // 10 seconds as mentioned in the docs
    maxRetries: 3,
    dependencies: [params.page, params.limit], // Utiliser les valeurs primitives
    initialData: initialData ? {
      data: initialData,
      pagination: {
        total: initialData.length,
        page: 1,
        limit: initialData.length,
        totalPages: 1,
        totalVolume: initialData.reduce((sum, item) => sum + item.amount, 0),
        hasNextPage: false,
        hasPreviousPage: false,
      }
    } : undefined
  });

  const updateParams = useCallback((newParams: Partial<UnstakingQueueParams>) => {
    console.log('Updating unstaking params:', newParams);
    setParams(prev => {
      const updated = { ...prev, ...newParams };
      console.log('Updated unstaking params:', updated);
      return updated;
    });
  }, []);

  // Memoized results
  const results = useMemo(() => ({
    unstakingQueue: response?.data || [],
    total: response?.pagination.total || 0,
    page: response?.pagination.page || 1,
    totalPages: response?.pagination.totalPages || 0,
    totalVolume: response?.pagination.totalVolume || 0,
    hasNextPage: response?.pagination.hasNextPage || false,
    hasPreviousPage: response?.pagination.hasPreviousPage || false,
    isLoading,
    error,
    updateParams,
    refetch
  }), [response, isLoading, error, updateParams, refetch]);

  return results;
}; 