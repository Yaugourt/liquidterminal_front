import { useState, useCallback } from 'react';
import { createProject, createProjectWithUpload } from '../api';
import { CreateProjectInput, CreateProjectWithUploadInput, Project, UseCreateProjectResult } from '../types';

export const useCreateProject = (): UseCreateProjectResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProjectMutation = useCallback(async (data: CreateProjectInput): Promise<Project | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await createProject(data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProjectWithUploadMutation = useCallback(async (data: CreateProjectWithUploadInput): Promise<Project | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await createProjectWithUpload(data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create project with upload');
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
    createProject: createProjectMutation,
    createProjectWithUpload: createProjectWithUploadMutation,
    isLoading,
    error
  };
}; 