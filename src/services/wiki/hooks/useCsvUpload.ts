import { useState } from 'react';
import { uploadCsvResources } from '../api';
import { CsvUploadApiResponse } from '../types';

interface UseCsvUploadReturn {
  uploadFile: (file: File) => Promise<void>;
  result: CsvUploadApiResponse | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export const useCsvUpload = (): UseCsvUploadReturn => {
  const [result, setResult] = useState<CsvUploadApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await uploadCsvResources(file);
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