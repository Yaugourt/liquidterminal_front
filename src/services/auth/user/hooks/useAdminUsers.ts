import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchAdminUsers } from '../api';
import { UseAdminUsersResult, AdminUsersQueryParams } from '../types';
import { useMemo } from 'react';

export function useAdminUsers(params?: AdminUsersQueryParams): UseAdminUsersResult {
  // Memoize les paramètres pour éviter les re-renders infinis
  const _memoizedParams = useMemo(_() => {
    if (!params) return undefined;
     // eslint-disable-line @typescript-eslint/no-unused-vars
    const cleanParams: unknown = {};
    
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }
    
    if (params.role) {
      cleanParams.role = params.role;
    }
    
    if (params.page) {
      cleanParams.page = params.page;
    }
    
    if (params.limit) {
      cleanParams.limit = params.limit;
    }
    
    return Object.keys(cleanParams).length > 0 ? cleanParams : undefined;
  }, [
    params?.search,
    params?.role,
    params?.page,
    params?.limit
  ]);

  const { data, isLoading, error, refetch } = useDataFetching({
    fetchFn: () => fetchAdminUsers(memoizedParams),
    dependencies: [
      memoizedParams?.search,
      memoizedParams?.role,
      memoizedParams?.page,
      memoizedParams?.limit
    ],
    refreshInterval: 0,
    maxRetries: 3,
    retryDelay: 1000
  });

  return {
    users: data?.data?.users || [],
    isLoading,
    error,
    refetch,
    pagination: data?.data?.pagination,
  };
} 