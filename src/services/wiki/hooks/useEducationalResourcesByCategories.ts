import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchResourcesByCategories } from '../api';
import { 
  UseEducationalResourcesResult, 
  EducationalResource 
} from '../types';

export function useEducationalResourcesByCategories(
  categoryIds: number[],
  initialData?: EducationalResource[]
): UseEducationalResourcesResult {
  const { data, isLoading, error, refetch } = useDataFetching<EducationalResource[]>({
    fetchFn: () => categoryIds.length > 0 ? fetchResourcesByCategories(categoryIds) : Promise.resolve([]),
    initialData,
    dependencies: [categoryIds],
    refreshInterval: 60000
  });

  return {
    resources: data || [],
    isLoading,
    error,
    refetch
  };
} 