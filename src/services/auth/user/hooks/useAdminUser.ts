import { useState, useEffect, useCallback } from 'react';
import { _fetchAdminUser } from '../api';
import { UseAdminUserResult } from '../types';
import { User } from '../../types';

export function useAdminUser(userId: number): UseAdminUserResult {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await _fetchAdminUser(userId);
      
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

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
  };
} 