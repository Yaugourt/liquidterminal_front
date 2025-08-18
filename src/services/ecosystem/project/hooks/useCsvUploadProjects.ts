import { useState } from 'react';
import { uploadCsvProjects } from '../api';
import { ProjectCsvUploadApiResponse } from '../types';

interface UseCsvUploadProjectsReturn {
  uploadFile: (file: File) => Promise<void>;
  result: ProjectCsvUploadApiResponse | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export const useCsvUploadProjects = (): UseCsvUploadProjectsReturn => {
  const [result, setResult] = useState<ProjectCsvUploadApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await uploadCsvProjects(file);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return { uploadFile, result, loading, error, reset };
};
