import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchCategories } from '../api';
import { Category, UseCategoriesResult } from '../types';

export const useCategories = (): UseCategoriesResult => {
  const { data, isLoading, error, refetch } = useDataFetching<Category[]>({
    fetchFn: async () => {
      const response = await fetchCategories();
      return response.data || [];
    },
    refreshInterval: 30000, // 30 seconds
    dependencies: [],
    maxRetries: 3
  });

  return {
    categories: data || [],
    isLoading,
    error,
    refetch
  };
}; 