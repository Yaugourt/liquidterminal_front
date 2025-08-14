import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchProjects } from '../api';
import { ProjectsResponse, ProjectQueryParams, UseProjectsResult } from '../types';

export const useProjects = (params?: ProjectQueryParams): UseProjectsResult => {
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchProjects(cleanParams);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setIsLoading(false);
    }
  }, [cleanParams]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects: data?.data || [],
    isLoading,
    error,
    refetch: loadProjects,
    pagination: data?.pagination
  };
}; 