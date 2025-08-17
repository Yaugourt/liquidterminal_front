import { useDataFetching } from '@/hooks/useDataFetching';
import { useState, useCallback, useEffect } from 'react';
import { 
  getLinkPreview, 
  getLinkPreviewsBatch
} from '../api';
import type { 
  LinkPreview, 
  LinkPreviewBatchResponse,
  UseLinkPreviewResult,
  UseLinkPreviewBatchResult
} from '../types';

/**
 * Hook pour récupérer un preview de lien par URL
 */
export const useLinkPreview = (url: string): UseLinkPreviewResult => {
  // Utiliser useLinkPreviewsBatch avec une seule URL pour la cohérence
  const { getPreview, isLoading, error, refetch } = useLinkPreviewsBatch(url ? [url] : []);
  
  return {
    data: getPreview(url),
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook pour récupérer plusieurs previews de liens en batch
 */
export const useLinkPreviewsBatch = (urls: string[]): UseLinkPreviewBatchResult => {
  const [previews, setPreviews] = useState<Map<string, LinkPreview>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const { data: response, isLoading, error, refetch } = useDataFetching<LinkPreviewBatchResponse>({
    fetchFn: async () => {
      if (!urls.length) return { success: false, results: [] };
      
      try {
        const batchResponse = await getLinkPreviewsBatch(urls);
        
        if (batchResponse.success) {
          return batchResponse;
        } else {
          // Fallback to individual requests if batch fails
          const individualPreviews = new Map<string, LinkPreview>();
          const individualErrors = new Map<string, string>();

          await Promise.all(
            urls.map(async (url) => {
              try {
                const response = await getLinkPreview(url);
                if (response.success) {
                  individualPreviews.set(url, response.data);
                } else {
                  individualErrors.set(url, response.error || 'Failed to load preview');
                }
              } catch {
                individualErrors.set(url, 'Network error');
              }
            })
          );

          // Convert maps back to batch response format
          const results = urls.map(url => ({
            url,
            success: individualPreviews.has(url),
            data: individualPreviews.get(url) || null,
            error: individualErrors.get(url) || null
          }));

          return { success: true, results };
        }
      } catch {
        // If everything fails, return error for all URLs
        const results = urls.map(url => ({
          url,
          success: false,
          data: null,
          error: 'Network error'
        }));
        return { success: false, results };
      }
    },
    initialData: { success: false, results: [] },
    dependencies: [urls.join(',')],
    refreshInterval: 300000 // 5 minutes instead of 30 seconds
  });

  useEffect(() => {
    if (response?.success) {
      const newPreviews = new Map<string, LinkPreview>();
      const newErrors = new Map<string, string>();

      response.results.forEach(result => {
        if (result.success && result.data) {
          newPreviews.set(result.url, result.data);
        } else if (result.error) {
          newErrors.set(result.url, result.error);
        }
      });

      setPreviews(newPreviews);
      setErrors(newErrors);
    }
  }, [response]);

  const getPreview = useCallback((url: string): LinkPreview | null => {
    return previews.get(url) || null;
  }, [previews]);

  const getError = useCallback((url: string): string | null => {
    return errors.get(url) || null;
  }, [errors]);

  return {
    previews,
    errors,
    isLoading,
    error,
    refetch,
    getPreview,
    getError
  };
}; 