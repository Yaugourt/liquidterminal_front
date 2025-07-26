import { useState } from 'react';
import { deleteEducationalResource } from '../api';
import { toast } from 'sonner';

export const useDeleteEducationalResource = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteResource = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deleteEducationalResource(id);
      if (response.success) {
        toast.success('Resource deleted successfully!');
        return true;
      } else {
        toast.error(response.message || 'Failed to delete resource');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete resource';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteResource,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}; 