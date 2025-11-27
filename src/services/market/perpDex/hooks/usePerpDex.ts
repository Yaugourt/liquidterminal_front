import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPerpDexByName } from '../api';
import { PerpDex } from '../types';

interface UsePerpDexOptions {
  refreshInterval?: number;
}

/**
 * Hook pour récupérer un PerpDex spécifique par son nom
 */
export function usePerpDex(name: string, options: UsePerpDexOptions = {}) {
  const { refreshInterval = 30000 } = options;

  const { 
    data, 
    isLoading, 
    isInitialLoading,
    error,
    refetch 
  } = useDataFetching<PerpDex | null>({
    fetchFn: () => fetchPerpDexByName(name),
    refreshInterval,
    maxRetries: 3,
    dependencies: [name]
  });

  return {
    dex: data,
    isLoading,
    isInitialLoading,
    error,
    refetch
  };
}

