import { useState, useCallback, useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchEducationalResources } from '../api';
import { 
  ResourceFilters, 
  ResourcesPaginatedResponse, 
  UseEducationalResourcesOptions,
  UseEducationalResourcesPaginatedResult 
} from '../types';

export function useEducationalResourcesPaginated({
  limit = 50,
  defaultParams = {},
  initialData,
  refreshInterval = 30000
}: UseEducationalResourcesOptions = {}): UseEducationalResourcesPaginatedResult {
  const [params, setParams] = useState<ResourceFilters>(() => ({
    limit,
    page: defaultParams.page || 1,
    ...defaultParams,
  }));

  const { 
    data: response, 
    isLoading, 
    error,
    refetch
  } = useDataFetching<ResourcesPaginatedResponse>({
    fetchFn: async () => {
      const apiResponse = await fetchEducationalResources(params);
      return {
        data: apiResponse.data,
        pagination: apiResponse.pagination,
        metadata: {
          lastUpdate: Date.now()
        }
      };
    },
    refreshInterval,
    maxRetries: 3,
    dependencies: [params],
    initialData: initialData ? {
      data: initialData,
      pagination: {
        total: initialData.length,
        page: 1,
        limit: initialData.length,
        totalPages: 1
      },
      metadata: {
        lastUpdate: Date.now()
      }
    } : undefined
  });

  const updateParams = useCallback((newParams: Partial<ResourceFilters>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Memoized results pour optimiser les re-renders
  const results = useMemo(() => ({
    resources: response?.data || [],
    total: response?.pagination.total || 0,
    page: response?.pagination.page || 1,
    totalPages: response?.pagination.totalPages || 0,
    metadata: response?.metadata,
    isLoading,
    error,
    updateParams,
    refetch
  }), [response, isLoading, error, updateParams, refetch]);

  return results;
} 