import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchProjectMetrics } from '../api';
import { ProjectMetricsResponse, UseProjectMetricsResult } from '../types';

/**
 * Fetches the aggregated, source-agnostic metrics for a project
 * (TVL, volume, fees, token snapshot, historical series).
 */
export const useProjectMetrics = (id: number): UseProjectMetricsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<ProjectMetricsResponse>({
    fetchFn: () => fetchProjectMetrics(id),
    refreshInterval: 60000,
    dependencies: [id],
    maxRetries: 2,
  });

  return {
    metrics: data?.data,
    isLoading,
    error,
    refetch,
  };
};
