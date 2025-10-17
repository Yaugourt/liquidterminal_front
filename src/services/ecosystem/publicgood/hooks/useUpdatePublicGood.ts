import { useState, useCallback } from 'react';
import { updatePublicGood } from '../api';
import { UpdatePublicGoodInput, PublicGood } from '../types';

export interface UseUpdatePublicGoodResult {
  updatePublicGood: (id: number, data: UpdatePublicGoodInput) => Promise<PublicGood | null>;
  isLoading: boolean;
  error: Error | null;
}

export const useUpdatePublicGood = (): UseUpdatePublicGoodResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMutation = useCallback(async (id: number, data: UpdatePublicGoodInput): Promise<PublicGood | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await updatePublicGood(id, data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update public good');
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
    updatePublicGood: updateMutation,
    isLoading,
    error
  };
};

