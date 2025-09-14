import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchProjects } from '../api';
import { ProjectsResponse, ProjectQueryParams, UseProjectsResult } from '../types';

export const useProjects = (params?: ProjectQueryParams): UseProjectsResult => {
  // Nettoyer les paramètres - supprimer undefined/null
  const cleanParams = useMemo(() => {
    if (!params) return {};
    
    const cleaned: Record<string, string | number | number[]> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'categoryIds' && Array.isArray(value) && value.length > 0) {
          cleaned[key] = value;
        } else if (key !== 'categoryIds') {
          cleaned[key] = value;
        }
      }
    });
    
    return cleaned;
  }, [params]);

  const { data, isLoading, error, refetch } = useDataFetching<ProjectsResponse>({
    fetchFn: async () => {
      return await fetchProjects(cleanParams);
    },
    refreshInterval: 30000, // 30 seconds
    dependencies: [JSON.stringify(cleanParams)], // Re-fetch when params change
    maxRetries: 3
  });

  return {
    projects: data?.data || [],
    isLoading,
    error,
    refetch,
    pagination: data?.pagination
  };
}; 