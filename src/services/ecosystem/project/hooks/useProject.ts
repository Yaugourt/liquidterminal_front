import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchProject } from '../api';
import { Project, UseProjectResult } from '../types';

/**
 * Fetches a single project by id.
 */
export const useProject = (id: number): UseProjectResult => {
  const { data, isLoading, isRefreshing, error, refetch, dataUpdatedAt } = useDataFetching<Project>({
    fetchFn: () => fetchProject(id),
    refreshInterval: 60000,
    dependencies: [id],
    maxRetries: 3,
  });

  return {
    project: data ?? undefined,
    isLoading,
    isRefreshing,
    error,
    refetch,
    dataUpdatedAt,
  };
};
