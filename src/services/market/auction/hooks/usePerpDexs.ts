import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPerpDexs } from '../api';
import { PerpDex, UsePerpDexsResult } from '../types';

/**
 * Hook pour récupérer la liste des perp dexs déployés
 */
export const usePerpDexs = (): UsePerpDexsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<PerpDex[]>({
    fetchFn: fetchPerpDexs,
    refreshInterval: 60000, // Refresh every minute
    maxRetries: 3,
    dependencies: []
  });

  return {
    perpDexs: data || [],
    isLoading,
    error,
    refetch
  };
};

