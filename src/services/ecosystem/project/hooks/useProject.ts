import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchProject } from '../api';
import { Project, UseProjectResult } from '../types';

/**
 * Fetches a single project by id.
 */
export const useProject = (id: number): UseProjectResult => {
  const { data, isLoading, error, refetch } = useDataFetching<Project>({
    fetchFn: () => fetchProject(id),
    refreshInterval: 60000,
    dependencies: [id],
    maxRetries: 3,
  });

  return {
    project: data ?? undefined,
    isLoading,
    error,
    refetch,
  };
};
