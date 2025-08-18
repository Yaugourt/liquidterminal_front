import { useState, useCallback } from 'react';
import { deleteProject } from '../api';
import { UseDeleteProjectResult } from '../types';

export const useDeleteProject = (): UseDeleteProjectResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteProjectMutation = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await deleteProject(id);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete project');
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
    deleteProject: deleteProjectMutation,
    isLoading,
    error
  };
}; 