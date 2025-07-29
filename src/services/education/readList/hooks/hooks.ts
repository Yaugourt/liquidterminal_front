import { useDataFetching } from '@/hooks/useDataFetching';
import { useState, useCallback } from 'react';
import { 
  getMyReadLists, getPublicReadLists, getReadList,
  createReadList as apiCreateReadList, updateReadList as apiUpdateReadList, deleteReadList as apiDeleteReadList,
  getReadListItems, addItemToReadList, updateReadListItem as apiUpdateReadListItem, deleteReadListItem as apiDeleteReadListItem
} from '../api';
import { validateReadList, validateReadListItem } from '../validation';
import type { ReadList, ReadListItem, ReadListCreateInput, ReadListUpdateInput, ReadListItemCreateInput, ReadListItemUpdateInput } from '../types';

// Utility functions
const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as any).response;
    switch (response?.status) {
      case 409: return 'A read list with this name already exists';
      case 400: return 'Invalid data provided';
      case 404: return 'Resource not found';
      case 403: return 'Access denied';
      default: return defaultMessage;
    }
  }
  return defaultMessage;
};

// Factory for mutation hooks
const createMutationHook = <TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  defaultErrorMessage: string,
  validationFn?: (input: TInput) => string[]
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (input: TInput): Promise<TOutput> => {
    setIsLoading(true);
    setError(null);
    try {
      if (validationFn) {
        const validationErrors = validationFn(input);
        if (validationErrors.length > 0) throw new Error(validationErrors.join(', '));
      }
      const result = await mutationFn(input);
      return result;
    } catch (error) {
      const message = handleApiError(error, defaultErrorMessage);
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, validationFn, defaultErrorMessage]);

  return { mutate, isLoading, error };
};

// Factory for data fetching hooks
const createFetchHook = <T>(
  fetchFn: () => Promise<T>,
  initialData: T,
  options: { dependencies?: any[], refreshInterval?: number } = {}
) => {
  return useDataFetching<T>({
    fetchFn: async () => {
      try {
        return await fetchFn();
      } catch (error) {
        return initialData;
      }
    },
    initialData,
    ...options
  });
};



// ============================================
// HOOKS POUR LES READ LISTS
// ============================================

export const useReadLists = () => createFetchHook(getMyReadLists, []);
export const usePublicReadLists = () => createFetchHook(getPublicReadLists, [], { refreshInterval: 30000 });
export const useReadList = (id: number | null) => createFetchHook(
  () => getReadList(id!),
  null,
  { dependencies: [id] }
);
export const useCreateReadList = () => createMutationHook(apiCreateReadList, 'Failed to create read list', validateReadList);
export const useDeleteReadList = () => createMutationHook(apiDeleteReadList, 'Failed to delete read list');

export const useUpdateReadList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: number, input: ReadListUpdateInput): Promise<ReadList> => {
    setIsLoading(true);
    setError(null);
    try {
      if (input.name !== undefined || input.description !== undefined) {
        const toValidate = { name: input.name || '', description: input.description, isPublic: input.isPublic || false };
        const validationErrors = validateReadList(toValidate);
        if (validationErrors.length > 0) throw new Error(validationErrors.join(', '));
      }
      const result = await apiUpdateReadList(id, input);
      return result;
    } catch (error) {
      const message = handleApiError(error, 'Failed to update read list');
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
};

// ============================================
// HOOKS POUR LES ITEMS
// ============================================

export const useReadListItems = (listId: number | null) => createFetchHook(
  () => getReadListItems(listId!),
  [],
  { dependencies: [listId], refreshInterval: 30000 }
);

export const useAddItemToReadList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (listId: number, input: ReadListItemCreateInput): Promise<ReadListItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const validationErrors = validateReadListItem(input);
      if (validationErrors.length > 0) throw new Error(validationErrors.join(', '));
      const result = await addItemToReadList(listId, input);
      return result;
    } catch (error) {
      const message = handleApiError(error, 'Failed to add item to read list');
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
};

export const useUpdateReadListItem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (itemId: number, input: ReadListItemUpdateInput): Promise<ReadListItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiUpdateReadListItem(itemId, input);
      return result;
    } catch (error) {
      const message = handleApiError(error, 'Failed to update read list item');
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
};
export const useDeleteReadListItem = () => createMutationHook(apiDeleteReadListItem, 'Failed to delete read list item');

export const useToggleReadStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ itemId, isRead }: { itemId: number; isRead: boolean }): Promise<ReadListItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiUpdateReadListItem(itemId, { isRead });
      return result;
    } catch (error) {
      const message = handleApiError(error, 'Failed to toggle read status');
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
};

// ============================================
// ALIASES POUR COMPATIBILITÉ
// ============================================
export const useAddResource = useAddItemToReadList;
export const useRemoveResource = useDeleteReadListItem; 