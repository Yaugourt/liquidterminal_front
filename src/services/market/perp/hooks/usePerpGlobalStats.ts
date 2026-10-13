import { PerpGlobalStats } from '../types';
import { fetchPerpGlobalStats } from '../api';
import { useDataFetching } from '../../../../hooks/useDataFetching';

interface UsePerpGlobalStatsResult {
  stats: PerpGlobalStats | null;
  isLoading: boolean;
  /** True during a background/manual refresh (drives the freshness cue spinner). */
  isRefreshing: boolean;
  error: Error | null;
  /** The last refresh failed; the data shown is the previous load. */
  isStale?: boolean;
  refetch: () => Promise<void>;
  /** Epoch ms of the last successful fetch, or null before the first. */
  dataUpdatedAt: number | null;
}

/**
 * Perp OI / volume aggregates, computed by the backend from its 10s asset-context
 * poller (Redis, no upstream call per request). KPI strips use the 10s default;
 * the sidebar badge passes a slow interval since it mounts on every page.
 */
export const usePerpGlobalStats = (refreshInterval = 10_000): UsePerpGlobalStatsResult => {
  const { data, isLoading, isRefreshing, error, isStale, refetch, dataUpdatedAt } = useDataFetching<PerpGlobalStats>({
    fetchFn: fetchPerpGlobalStats,
    refreshInterval,
  });

  return {
    stats: data,
    isLoading,
    isRefreshing,
    error,
    isStale,
    refetch,
    dataUpdatedAt
  };
}; 