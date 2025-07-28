import { useState, useEffect, useCallback } from 'react';
import { fetchAdminUser } from '../api';
import { UseAdminUserResult } from '../types';
import { User } from '../../types';

export function useAdminUser(userId: number): UseAdminUserResult {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const _fetchUser = useCallback(_async () => {
    if (!userId) return;
     // eslint-disable-line @typescript-eslint/no-unused-vars
    try {
      setIsLoading(true);
      setError(null);
      const _response = await fetchAdminUser(userId);
       // eslint-disable-line @typescript-eslint/no-unused-vars
      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Failed to fetch user');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(_() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
  };
} 