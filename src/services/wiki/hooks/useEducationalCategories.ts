import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchEducationalCategories } from '../api';
import { 
  UseEducationalCategoriesResult, 
  CategoryParams, 
  CategoriesResponse,
  UseEducationalCategoriesOptions 
} from '../types';
import { useState, useCallback } from 'react';

export const useEducationalCategories = (
  initialParams?: CategoryParams,
  options: UseEducationalCategoriesOptions = {}
): UseEducationalCategoriesResult => {
  const [params, setParams] = useState<CategoryParams>({
    limit: initialParams?.limit || 100,
    page: initialParams?.page || 1,
    sortBy: initialParams?.sortBy || 'name',
    sortOrder: initialParams?.sortOrder || 'asc',
    ...initialParams
  });

  const { data, isLoading, error, refetch } = useDataFetching<CategoriesResponse>({
    fetchFn: () => fetchEducationalCategories(params),
    initialData: options.initialData ? {
      success: true,
      data: options.initialData,
      pagination: {
        total: options.initialData.length,
        page: 1,
        limit: 50,
        totalPages: 1
      }
    } : undefined,
    dependencies: [JSON.stringify(params)],
    refreshInterval: options.refreshInterval || 60000 // 60 secondes pour données statiques
  });

  const updateParams = useCallback((newParams: Partial<CategoryParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    categories: data?.data || [],
    isLoading,
    error,
    refetch,
    pagination: data?.pagination,
    updateParams
  };
}; 