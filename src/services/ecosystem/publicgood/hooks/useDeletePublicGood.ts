import { useState, useCallback } from 'react';
import { deletePublicGood } from '../api';

export interface UseDeletePublicGoodResult {
  deletePublicGood: (id: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDeletePublicGood = (): UseDeletePublicGoodResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteMutation = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await deletePublicGood(id);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete public good');
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
    deletePublicGood: deleteMutation,
    isLoading,
    error
  };
};

