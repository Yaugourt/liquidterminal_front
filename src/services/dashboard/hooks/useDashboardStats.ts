import { DashboardGlobalStats, UseDashboardStatsResult, fetchDashboardGlobalStats } from '../index';
import { useDataFetching } from '../../../hooks/useDataFetching';

export const useDashboardStats = (initialData?: DashboardGlobalStats): UseDashboardStatsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<DashboardGlobalStats>({
    fetchFn: fetchDashboardGlobalStats,
    initialData,
    // Assembled from shared backend caches, flat in visitors: live pollers
    // (15-30 s) plus DefiLlama bridged USDC cached 5 min (null when unavailable).
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