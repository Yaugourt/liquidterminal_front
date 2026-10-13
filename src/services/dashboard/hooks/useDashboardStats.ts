import { DashboardGlobalStats, UseDashboardStatsResult, fetchDashboardGlobalStats } from '../index';
import { useDataFetching } from '../../../hooks/useDataFetching';

export const useDashboardStats = (initialData?: DashboardGlobalStats): UseDashboardStatsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<DashboardGlobalStats>({
    fetchFn: fetchDashboardGlobalStats,
    initialData,
    // Assembled from the backend's live pollers (10-30s): no upstream cost.
    refreshInterval: 15000,
    maxRetries: 3
  });

  return {
    stats: data ?? undefined,
    isLoading,
    error,
    refetch
  };
}; 