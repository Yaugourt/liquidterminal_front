import { useState, useCallback } from 'react';
import { _deleteAdminUser } from '../api';
import { UseAdminDeleteUserResult } from '../types';

export function useAdminDeleteUser(): UseAdminDeleteUserResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteUser = useCallback(async (userId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await _deleteAdminUser(userId);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deleteUser,
    isLoading,
    error,
  };
} 