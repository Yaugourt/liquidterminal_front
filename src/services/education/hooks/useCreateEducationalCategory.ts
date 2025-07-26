import { useState } from 'react';
import { createEducationalCategory } from '../api';
import { CreateCategoryInput, CategoryResponse } from '../types';
import { toast } from 'sonner';

export const useCreateEducationalCategory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (data: CreateCategoryInput): Promise<CategoryResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createEducationalCategory(data);
      toast.success('Category created successfully!');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCategory,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}; 