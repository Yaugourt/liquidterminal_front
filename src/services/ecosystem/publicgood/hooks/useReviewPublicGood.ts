import { useState, useCallback } from 'react';
import { reviewPublicGood } from '../api';
import { ReviewPublicGoodInput, PublicGood } from '../types';

export interface UseReviewPublicGoodResult {
  reviewPublicGood: (id: number, reviewData: ReviewPublicGoodInput) => Promise<PublicGood | null>;
  isLoading: boolean;
  error: Error | null;
}

export const useReviewPublicGood = (): UseReviewPublicGoodResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reviewMutation = useCallback(async (id: number, reviewData: ReviewPublicGoodInput): Promise<PublicGood | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await reviewPublicGood(id, reviewData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to review public good');
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
    reviewPublicGood: reviewMutation,
    isLoading,
    error
  };
};

