import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchEducationalCategories } from '../api';
import { 
  UseEducationalCategoriesResult, 
  CategoryParams, 
  CategoriesResponse,
  UseEducationalCategoriesOptions 
} from '../types';

export const useEducationalCategories = (
  params?: CategoryParams,
  options: UseEducationalCategoriesOptions = {}
): UseEducationalCategoriesResult => {
  const { data, isLoading, error, refetch } = useDataFetching<CategoriesResponse>({
    fetchFn: () => fetchEducationalCategories(params),
    initialData: options.initialData ? {
      success: true,
      data: options.initialData
    } : undefined,
    dependencies: [JSON.stringify(params)],
    refreshInterval: options.refreshInterval || 60000 // 60 secondes pour données statiques
  });

  return {
    categories: data?.data || [],
    isLoading,
    error,
    refetch
  };
}; 