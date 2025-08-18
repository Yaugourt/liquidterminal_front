import { useState, useCallback } from 'react';
import { updateProject } from '../api';
import { UpdateProjectInput, Project, UseUpdateProjectResult } from '../types';

export const useUpdateProject = (): UseUpdateProjectResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProjectMutation = useCallback(async (id: number, data: UpdateProjectInput): Promise<Project | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await updateProject(id, data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update project');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateProject: updateProjectMutation,
    isLoading,
    error
  };
}; 