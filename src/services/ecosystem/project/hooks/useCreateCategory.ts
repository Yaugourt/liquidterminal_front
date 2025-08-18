import { useState, useCallback } from 'react';
import { createCategory } from '../api';
import { CreateCategoryInput, Category, UseCreateCategoryResult } from '../types';

export const useCreateCategory = (): UseCreateCategoryResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCategoryMutation = useCallback(async (data: CreateCategoryInput): Promise<Category | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await createCategory(data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create category');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createCategory: createCategoryMutation,
    isLoading,
    error
  };
}; 