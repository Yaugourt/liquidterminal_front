import { useState, useEffect, useCallback } from 'react';
import {
  WalletListResponse
} from '../types';
import {
  getUserWalletLists
} from '../walletlist.service';

/**
 * Hook pour récupérer les listes de l'utilisateur
 */
export const useUserWalletLists = (params?: { 
  page?: number; 
  limit?: number; 
  search?: string;
  enabled?: boolean;
}) => {
  const [data, setData] = useState<WalletListResponse>({ data: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const enabled = params?.enabled;
  const page = params?.page;
  const limit = params?.limit;
  const search = params?.search;

  const fetchData = useCallback(async () => {
    if (enabled === false) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUserWalletLists({ page, limit, search });
      setData(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, page, limit, search]);

  useEffect(() => {
    if (enabled !== false) {
      fetchData();
    }
  }, [fetchData, enabled]);

  return {
    data: data.data,
    pagination: data.pagination,
    isLoading,
    error,
    refetch: fetchData
  };
};
