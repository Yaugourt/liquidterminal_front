import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchEducationalResources } from '../api';
import { 
  UseEducationalResourcesResult, 
  ResourceFilters, 
  ResourcesResponse,
  UseEducationalResourcesOptions 
} from '../types';

export const useEducationalResources = (
  filters?: ResourceFilters,
  options: UseEducationalResourcesOptions = {}
): UseEducationalResourcesResult => {
  const { data, isLoading, error, refetch } = useDataFetching<ResourcesResponse>({
    fetchFn: () => fetchEducationalResources(filters),
    initialData: options.initialData ? {
      success: true,
      data: options.initialData,
      pagination: {
        total: options.initialData.length,
        page: 1,
        limit: options.initialData.length,
        totalPages: 1
      }
    } : undefined,
    dependencies: [JSON.stringify(filters)],
    refreshInterval: options.refreshInterval || 30000 // 30 secondes par défaut
  });

  return {
    resources: data?.data || [],
    isLoading,
    error,
    refetch
  };
}; 