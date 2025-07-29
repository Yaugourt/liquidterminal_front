import { useState, useCallback } from 'react';
import { updateAdminUser } from '../api';
import { UseAdminUpdateUserResult, AdminUpdateUserInput } from '../types';
import { User } from '../../types';

export function useAdminUpdateUser(): UseAdminUpdateUserResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateUser = useCallback(async (userId: number, data: AdminUpdateUserInput): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await updateAdminUser(userId, data);
      
      if (response.success) {
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to update user');
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
    updateUser,
    isLoading,
    error,
  };
} 