import { DashboardGlobalStats, UseDashboardStatsResult } from '../types';
import { fetchDashboardGlobalStats } from '../api';
import { useDataFetching } from '../../../hooks/useDataFetching';

export const useDashboardStats = (): UseDashboardStatsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<DashboardGlobalStats>({
    fetchFn: fetchDashboardGlobalStats
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch
  };
}; 