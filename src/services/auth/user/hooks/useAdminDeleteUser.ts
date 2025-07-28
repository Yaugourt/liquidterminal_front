import { useState, useCallback } from 'react';
import { deleteAdminUser } from '../api';
import { UseAdminDeleteUserResult } from '../types';

export function useAdminDeleteUser(): UseAdminDeleteUserResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const _deleteUser = useCallback(async (userId: number): Promise<boolean> => {
    try {
      setIsLoading(true); // eslint-disable-line @typescript-eslint/no-unused-vars
      setError(null);
      const _response = await deleteAdminUser(userId);
       // eslint-disable-line @typescript-eslint/no-unused-vars
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      const _error = err instanceof Error ? err : new Error('Unknown error'); // eslint-disable-line @typescript-eslint/no-unused-vars
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