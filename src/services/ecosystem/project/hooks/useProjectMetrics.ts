import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchProjectMetrics } from '../api';
import { ProjectMetricsResponse, UseProjectMetricsResult } from '../types';

/**
 * Fetches the aggregated, source-agnostic metrics for a project
 * (TVL, volume, fees, token snapshot, historical series).
 * PARKED: GET /project/:id/metrics is not deployed on the backend yet
 * (404 for every id). Keep this hook unused until the route ships.
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
