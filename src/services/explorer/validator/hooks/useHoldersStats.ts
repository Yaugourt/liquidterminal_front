import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchHoldersStats } from '../staking-holders';
import { UseHoldersStatsResult, HoldersStatsResponse } from '../types/holders';

/**
 * Hypurrscan regenerates the stakedHYPE list every ~10 min and the backend
 * keeps its view 10 min: polling faster only re-reads the same stats (same
 * cadence as the token holders tab).
 */
export const STAKED_HOLDERS_REFRESH_MS = 5 * 60_000;

/**
 * Hook pour récupérer les statistiques des holders de HYPE staké
 */
export const useHoldersStats = (): UseHoldersStatsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<HoldersStatsResponse>({
    fetchFn: fetchHoldersStats,
    refreshInterval: STAKED_HOLDERS_REFRESH_MS,
  });

  return {
    stats: data?.data || null,
    isLoading,
    error,
    refetch
  };
}; 