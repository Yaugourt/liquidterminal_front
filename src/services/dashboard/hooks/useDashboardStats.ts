import { DashboardGlobalStats, UseDashboardStatsResult } from '../types';
import { fetchDashboardGlobalStats } from '../api';
import { useDataFetching } from '../../../hooks/useDataFetching';

export const useDashboardStats = (initialData?: DashboardGlobalStats): UseDashboardStatsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<DashboardGlobalStats>({
    fetchFn: fetchDashboardGlobalStats,
    initialData
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch
  };
}; 