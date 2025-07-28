import { useState, useCallback } from 'react';
import { updateAdminUser } from '../api';
import { UseAdminUpdateUserResult, AdminUpdateUserInput } from '../types';
import { User } from '../../types';

export function useAdminUpdateUser(): UseAdminUpdateUserResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const _updateUser = useCallback(async (userId: number, data: AdminUpdateUserInput): Promise<User | null> => {
    try {
      setIsLoading(true); // eslint-disable-line @typescript-eslint/no-unused-vars
      setError(null);
      const _response = await updateAdminUser(userId, data);
       // eslint-disable-line @typescript-eslint/no-unused-vars
      if (response.success) {
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to update user');
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
    updateUser,
    isLoading,
    error,
  };
} 