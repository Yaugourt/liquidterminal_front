import { useState, useCallback } from 'react';
import { createPublicGood } from '../api';
import { CreatePublicGoodInput, PublicGood } from '../types';

export interface UseCreatePublicGoodResult {
  createPublicGood: (data: CreatePublicGoodInput) => Promise<PublicGood | null>;
  isLoading: boolean;
  error: Error | null;
}

export const useCreatePublicGood = (): UseCreatePublicGoodResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMutation = useCallback(async (data: CreatePublicGoodInput): Promise<PublicGood | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await createPublicGood(data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create public good');
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
    createPublicGood: createMutation,
    isLoading,
    error
  };
};

