import { useState, useEffect, useCallback } from 'react';
import { 
  WalletList,
  WalletListItem,
  WalletListResponse,
  CreateWalletListInput,
  UpdateWalletListInput,
  CreateWalletListItemInput,
  UpdateWalletListItemInput
} from '../types';
import {
  getPublicWalletLists,
  getUserWalletLists,
  getWalletListById,
  createWalletList,
  updateWalletList,
  deleteWalletList,
  copyWalletList,
  getWalletListItems,
  addWalletToList,
  updateWalletListItem,
  removeWalletFromList
} from '../walletlist.service';

/**
 * Hook pour récupérer les listes publiques
 */
export const usePublicWalletLists = (params?: { 
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
      const response = await getPublicWalletLists({ page, limit, search });
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

/**
 * Hook pour récupérer une liste spécifique
 */
export const useWalletList = (id: number | null) => {
  const [data, setData] = useState<WalletList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getWalletListById(id);
      setData(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};

/**
 * Hook pour récupérer les items d'une liste
 */
export const useWalletListItems = (
  listId: number | null,
  params?: { page?: number; limit?: number; search?: string }
) => {
  const [data, setData] = useState<WalletListItem[]>([]);
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrevious: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const page = params?.page;
  const limit = params?.limit;
  const search = params?.search;

  const fetchData = useCallback(async () => {
    if (!listId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getWalletListItems(listId, { page, limit, search });
      setData(response.data);
      setPagination(response.pagination || null);
    } catch (err) {
      // Treat 404 as empty list; only surface other errors
      const e = err as { code?: string };
      if (e?.code === 'NOT_FOUND') {
        setData([]);
        setPagination(null);
        setError(null);
      } else {
        setError(err as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [listId, page, limit, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    pagination,
    isLoading,
    error,
    refetch: fetchData
  };
};

/**
 * Hook pour les mutations des listes de wallets
 */
export const useWalletListMutations = () => {
  // Pas d'état de loading global, chaque fonction gère son propre état
  const [error, setError] = useState<Error | null>(null);

  const executeWithErrorHandling = async <T>(operation: () => Promise<T>): Promise<T> => {
    try {
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const createList = useCallback(async (data: CreateWalletListInput): Promise<WalletList> => {
    return executeWithErrorHandling(() => createWalletList(data));
  }, []);

  const updateList = useCallback(async (id: number, data: UpdateWalletListInput): Promise<WalletList> => {
    return executeWithErrorHandling(() => updateWalletList(id, data));
  }, []);

  const deleteList = useCallback(async (id: number): Promise<void> => {
    return executeWithErrorHandling(() => deleteWalletList(id));
  }, []);

  const copyList = useCallback(async (id: number): Promise<WalletList> => {
    return executeWithErrorHandling(() => copyWalletList(id));
  }, []);

  const addWallet = useCallback(async (listId: number, data: CreateWalletListItemInput): Promise<WalletListItem> => {
    return executeWithErrorHandling(() => addWalletToList(listId, data));
  }, []);

  const updateItem = useCallback(async (itemId: number, data: UpdateWalletListItemInput): Promise<WalletListItem> => {
    return executeWithErrorHandling(() => updateWalletListItem(itemId, data));
  }, []);

  const removeWallet = useCallback(async (itemId: number): Promise<void> => {
    return executeWithErrorHandling(() => removeWalletFromList(itemId));
  }, []);

  return {
    error,
    createList,
    updateList,
    deleteList,
    copyList,
    addWallet,
    updateItem,
    removeWallet
  };
};
