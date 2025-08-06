import { useState, useEffect, useCallback } from 'react';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProjectCategories(projectId);
      if (response.success) {
        setCategories(response.data);
      } else {
        throw new Error('Failed to fetch project categories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project categories';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const assignCategories = useCallback(async (categoryIds: number[]) => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await assignProjectCategories(projectId, categoryIds);
      if (response.success && response.data.categories) {
        setCategories(response.data.categories);
      } else {
        throw new Error('Failed to assign categories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign categories';
      setError(new Error(errorMessage));
      throw err; // Re-throw pour permettre la gestion d'erreur dans le composant
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const removeCategories = useCallback(async (categoryIds: number[]) => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await removeProjectCategories(projectId, categoryIds);
      if (response.success && response.data.categories) {
        setCategories(response.data.categories);
      } else {
        throw new Error('Failed to remove categories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove categories';
      setError(new Error(errorMessage));
      throw err; // Re-throw pour permettre la gestion d'erreur dans le composant
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    categories,
    isLoading,
    error,
    assignCategories,
    removeCategories,
    refetch
  };
};