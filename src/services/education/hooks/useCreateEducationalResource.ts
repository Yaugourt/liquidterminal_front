import { useState } from 'react';
import { createEducationalResource } from '../api';
import { CreateResourceInput, ResourceResponse } from '../types';
import { toast } from 'sonner';

export const useCreateEducationalResource = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createResource = async (data: CreateResourceInput): Promise<ResourceResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createEducationalResource(data);
      toast.success('Resource created successfully!');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create resource';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createResource,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}; 