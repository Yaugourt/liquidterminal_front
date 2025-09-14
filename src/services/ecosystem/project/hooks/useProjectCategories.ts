import { useCallback } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { 
  fetchProjectCategories, 
  assignProjectCategories, 
  removeProjectCategories 
} from '../api';
import { Category, UseProjectCategoriesResult } from '../types';

/**
 * Hook pour gérer les catégories d'un projet spécifique
 */
export const useProjectCategories = (projectId: number): UseProjectCategoriesResult => {
  const { data: categories, isLoading, error, refetch } = useDataFetching<Category[]>({
    fetchFn: async () => {
      if (!projectId) return [];
      const response = await fetchProjectCategories(projectId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch project categories');
      }
    },
    refreshInterval: 30000, // 30 seconds
    dependencies: [projectId], // Re-fetch when projectId changes
    maxRetries: 3
  });

  const assignCategories = useCallback(async (categoryIds: number[]) => {
    if (!projectId) return;
    
    try {
      const response = await assignProjectCategories(projectId, categoryIds);
      if (response.success && response.data.categories) {
        // Re-fetch les données après assignation réussie
        refetch();
      } else {
        throw new Error('Failed to assign categories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign categories';
      throw new Error(errorMessage); // Re-throw pour permettre la gestion d'erreur dans le composant
    }
  }, [projectId, refetch]);

  const removeCategories = useCallback(async (categoryIds: number[]) => {
    if (!projectId) return;
    
    try {
      const response = await removeProjectCategories(projectId, categoryIds);
      if (response.success && response.data.categories) {
        // Re-fetch les données après suppression réussie
        refetch();
      } else {
        throw new Error('Failed to remove categories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove categories';
      throw new Error(errorMessage); // Re-throw pour permettre la gestion d'erreur dans le composant
    }
  }, [projectId, refetch]);

  return {
    categories: categories || [],
    isLoading,
    error,
    assignCategories,
    removeCategories,
    refetch
  };
};