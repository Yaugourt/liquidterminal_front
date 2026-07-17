import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchProjectsMetricsMap } from '../api';
import { ProjectListMetric, UseProjectsMetricsMapResult } from '../types';

/**
 * Batch metrics of every linked project, keyed by projectId. One request
 * decorates all list cards and powers the "TVL on HL" sort.
 */
export const useProjectsMetricsMap = (): UseProjectsMetricsMapResult => {
  const { data, isLoading, error } = useDataFetching<ProjectListMetric[]>({
    fetchFn: () => fetchProjectsMetricsMap(),
    refreshInterval: 300000,
    dependencies: [],
    maxRetries: 2,
  });

  const metricsById = useMemo(() => {
    const map = new Map<number, ProjectListMetric>();
    for (const row of data ?? []) map.set(row.projectId, row);
    return map;
  }, [data]);

  return { metricsById, isLoading, error };
};
