import { useDataFetching } from '../../../hooks/useDataFetching';
import { fetchProjects } from '../api';
import { ProjectsResponse, ProjectQueryParams, UseProjectsResult } from '../types';

export const useProjects = (
  params?: ProjectQueryParams,
  initialData?: ProjectsResponse
): UseProjectsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<ProjectsResponse>({
    fetchFn: () => fetchProjects(params),
    initialData,
    dependencies: [JSON.stringify(params)],
    refreshInterval: 60000 // 60 seconds
  });

  return {
    projects: data?.data || [],
    isLoading,
    error,
    refetch,
    pagination: data?.pagination
  };
}; 