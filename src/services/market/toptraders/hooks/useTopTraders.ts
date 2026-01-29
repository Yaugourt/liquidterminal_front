import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTopTraders } from '../api';
import {
  UseTopTradersResult,
  UseTopTradersOptions,
  TopTradersResponse
} from '../types';

/**
 * Hook pour récupérer le classement des top traders sur les dernières 24h
 * @param options - Options de configuration (sort, limit, initialData)
 * @returns Données des top traders avec état de chargement et erreur
 */
export const useTopTraders = ({
  sort = 'pnl_pos',
  limit = 50,
  initialData
}: UseTopTradersOptions = {}): UseTopTradersResult => {
  // Mémoriser les paramètres pour éviter les re-renders inutiles
  const params = useMemo(() => ({ sort, limit }), [sort, limit]);

  const { data, isLoading, error, refetch } = useDataFetching<TopTradersResponse>({
    fetchFn: () => fetchTopTraders(params),
    dependencies: [params.sort, params.limit],
    refreshInterval: 60000, // 60s - aligné avec le cache backend (55s) + marge
    maxRetries: 3,
    initialData: initialData ? {
      success: true,
      data: initialData,
      metadata: {
        sort: params.sort,
        limit: params.limit,
        executionTimeMs: 0,
        cachedAt: new Date().toISOString()
      }
    } : undefined
  });

  return {
    traders: data?.data || [],
    metadata: data?.metadata || null,
    isLoading,
    error,
    refetch
  };
};
