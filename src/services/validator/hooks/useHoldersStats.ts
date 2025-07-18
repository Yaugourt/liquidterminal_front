import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchHoldersStats } from '../staking-holders';
import { UseHoldersStatsResult, HoldersStatsResponse } from '../types/holders';

/**
 * Hook pour récupérer les statistiques des holders de HYPE staké
 */
export const useHoldersStats = (): UseHoldersStatsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<HoldersStatsResponse>({
    fetchFn: fetchHoldersStats,
    refreshInterval: 30000 // 30 secondes
  });

  return {
    stats: data?.data || null,
    isLoading,
    error,
    refetch
  };
}; 