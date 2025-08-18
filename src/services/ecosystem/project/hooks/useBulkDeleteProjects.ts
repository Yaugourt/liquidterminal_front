import { useState, useCallback } from 'react';
import { deleteProject } from '../api';
import { toast } from 'sonner';

export const useBulkDeleteProjects = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkDeleteProjects = useCallback(async (projectIds: number[]): Promise<boolean> => {
    if (projectIds.length === 0) return true;

    try {
      setIsLoading(true);
      setError(null);

      // Delete projects sequentially to avoid overwhelming the server
      const results = await Promise.allSettled(
        projectIds.map(id => deleteProject(id))
      );

      // Check results
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;

      const failed = results.filter(result => 
        result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
      ).length;

      if (failed > 0) {
        const errorMessage = failed === projectIds.length 
          ? 'Failed to delete any projects'
          : `Failed to delete ${failed} out of ${projectIds.length} projects`;
        
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }

      if (successful > 0) {
        toast.success(`Successfully deleted ${successful} project${successful > 1 ? 's' : ''}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete projects';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    bulkDeleteProjects,
    isLoading,
    error,
    clearError
  };
}; 