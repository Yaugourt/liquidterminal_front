import { SpotGlobalStats } from '../types';
import { fetchSpotGlobalStats } from '../api';
import { useDataFetching } from '../../../../hooks/useDataFetching';

interface UseSpotGlobalStatsResult {
  stats: SpotGlobalStats | null;
  isLoading: boolean;
  error: Error | null;
  /** The last refresh failed; the data shown is the previous load. */
  isStale?: boolean;
  refetch: () => Promise<void>;
}

/**
 * Spot volume / market-cap aggregates, computed by the backend from its 10s
 * asset-context poller (Redis, no upstream call per request). KPI strips use
 * the 10s default; the sidebar badge passes a slow interval since it mounts on
 * every page.
 */
export const useSpotGlobalStats = (refreshInterval = 10_000): UseSpotGlobalStatsResult => {
  const { data, isLoading, error, isStale, refetch } = useDataFetching<SpotGlobalStats>({
    fetchFn: fetchSpotGlobalStats,
    refreshInterval,
  });

  return {
    stats: data,
    isLoading,
    error,
    isStale,
    refetch
  };
}; 