import { useDataFetching } from '../../../hooks/useDataFetching';
import { fetchCategories } from '../api';
import { CategoriesResponse, UseCategoriesResult } from '../types';

export const useCategories = (initialData?: CategoriesResponse): UseCategoriesResult => {
  const { data, isLoading, error, refetch } = useDataFetching<CategoriesResponse>({
    fetchFn: fetchCategories,
    initialData,
    refreshInterval: 60000 // 60 seconds
  });

  return {
    categories: data?.data || [],
    isLoading,
    error,
    refetch
  };
}; 