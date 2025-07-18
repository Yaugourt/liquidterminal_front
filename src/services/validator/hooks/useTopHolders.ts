import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTopHolders } from '../staking-holders';
import { UseTopHoldersResult, TopHoldersParams, TopHoldersResponse } from '../types/holders';

/**
 * Hook pour récupérer les top holders de HYPE staké
 */
export const useTopHolders = (
  limit: number = 10
): UseTopHoldersResult => {
  const params: TopHoldersParams = { limit };

  const { data, isLoading, error, refetch } = useDataFetching<TopHoldersResponse>({
    fetchFn: () => fetchTopHolders(params),
    dependencies: [limit],
    refreshInterval: 30000 // 30 secondes
  });

  return {
    topHolders: data?.data || [],
    isLoading,
    error,
    refetch
  };
}; 