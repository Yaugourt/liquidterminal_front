import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchActiveUsers } from '../api';
import {
  UseActiveUsersResult,
  UseActiveUsersOptions,
  ActiveUsersResponse
} from '../types';

/**
 * Hook pour récupérer les utilisateurs les plus actifs
 * @param options - Options de configuration (hours, limit, initialData)
 * @returns Données des utilisateurs actifs avec état de chargement et erreur
 */
export const useActiveUsers = ({
  hours = 24,
  limit = 100,
  initialData
}: UseActiveUsersOptions = {}): UseActiveUsersResult => {
  // Mémoriser les paramètres pour éviter les re-renders inutiles
  const params = useMemo(() => ({ hours, limit }), [hours, limit]);

  const { data, isLoading, error, refetch } = useDataFetching<ActiveUsersResponse>({
    fetchFn: () => fetchActiveUsers(params),
    dependencies: [params.hours, params.limit],
    // 30s: the backend poller refreshes this shared snapshot every 60s.
    refreshInterval: 30000,
    maxRetries: 3,
    initialData: initialData ? {
      success: true,
      data: initialData,
      metadata: {
        hours: params.hours,
        limit: params.limit,
        totalCount: initialData.length,
        executionTimeMs: 0,
        cachedAt: new Date().toISOString()
      }
    } : undefined
  });

  return {
    users: data?.data || [],
    metadata: data?.metadata || null,
    isLoading,
    error,
    refetch
  };
};
