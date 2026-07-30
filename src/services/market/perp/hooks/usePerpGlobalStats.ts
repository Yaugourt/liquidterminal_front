import { PerpGlobalStats } from '../types';
import { fetchPerpGlobalStats } from '../api';
import { useDataFetching } from '../../../../hooks/useDataFetching';

interface UsePerpGlobalStatsResult {
  stats: PerpGlobalStats | null;
  isLoading: boolean;
  /** True during a background/manual refresh (drives the freshness cue spinner). */
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  /** Epoch ms of the last successful fetch, or null before the first. */
  dataUpdatedAt: number | null;
}

export const usePerpGlobalStats = (): UsePerpGlobalStatsResult => {
  const { data, isLoading, isRefreshing, error, refetch, dataUpdatedAt } = useDataFetching<PerpGlobalStats>({
    fetchFn: fetchPerpGlobalStats,
  });

  return {
    stats: data,
    isLoading,
    isRefreshing,
    error,
    refetch,
    dataUpdatedAt
  };
}; 