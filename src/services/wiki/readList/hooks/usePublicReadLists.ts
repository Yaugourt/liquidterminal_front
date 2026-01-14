import { useState, useCallback, useEffect } from 'react';
import { getPublicReadListsPaginated, copyPublicReadList } from '../api';
import { 
  PublicReadList, 
  PublicReadListQueryParams, 
  PublicReadListPagination 
} from '../types';
import { readListMessages, handleReadListApiError } from '@/lib/toast-messages';

export const usePublicReadLists = (initialParams?: PublicReadListQueryParams) => {
  const [readLists, setReadLists] = useState<PublicReadList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PublicReadListPagination | null>(null);
  const [params, setParams] = useState<PublicReadListQueryParams>({
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 12,
    sort: initialParams?.sort || 'updatedAt',
    order: initialParams?.order || 'desc',
    search: initialParams?.search || '',
  });

  const fetchReadLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPublicReadListsPaginated(params);
      if (response.success) {
        setReadLists(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to load public read lists');
      }
    } catch (err) {
      const errorMessage = handleReadListApiError(err);
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch public read lists');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const updateParams = useCallback((newParams: Partial<PublicReadListQueryParams>) => {
    setParams(prev => {
      const shouldResetPage = newParams.search !== undefined || newParams.sort !== undefined || newParams.order !== undefined;
      return {
        ...prev,
        ...newParams,
        // Reset to page 1 when changing search or filters
        page: shouldResetPage ? 1 : (prev.page || 1)
      };
    });
  }, []);

  const copyReadList = useCallback(async (readListId: number): Promise<boolean> => {
    try {
      const response = await copyPublicReadList(readListId);
      if (response.success) {
        readListMessages.success.listCreated(response.data.name);
        return true;
      } else {
        handleReadListApiError(new Error(response.message || 'Copy failed'));
        return false;
      }
    } catch (err) {
      handleReadListApiError(err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchReadLists();
  }, [fetchReadLists]);

  return {
    readLists,
    loading,
    error,
    pagination,
    params,
    updateParams,
    copyReadList,
    refetch: fetchReadLists
  };
}; 