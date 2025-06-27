import { DashboardGlobalStats, UseDashboardStatsResult, fetchDashboardGlobalStats } from '../index';
import { useDataFetching } from '../../../hooks/useDataFetching';

export const useDashboardStats = (initialData?: DashboardGlobalStats): UseDashboardStatsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<DashboardGlobalStats>({
    fetchFn: fetchDashboardGlobalStats,
    initialData
  });

  return {
    stats: data ?? undefined,
    isLoading,
    error,
    refetch
  };
}; 