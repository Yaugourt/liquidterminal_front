import { get, post, put, del } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { 
  ReadList, 
  ReadListCreateInput, 
  ReadListUpdateInput,
  ReadListItem,
  ReadListItemCreateInput,
  ReadListItemUpdateInput,
  PublicReadListQueryParams,
  PublicReadListsResponse,
  ReadListCopyResponse
} from './types';

// Get all user's read lists (private and public) - NOUVEAU: utiliser JWT
export const getMyReadLists = async (): Promise<{success: boolean, data: ReadList[], message?: string}> => {
  return withErrorHandling(async () => {
    const response = await get<{success: boolean, data: ReadList[], message?: string}>('/readlists/my-lists');
    return response || {success: true, data: []};
  }, 'fetching my read lists');
};



// Create a new read list - NOUVEAU: utiliser JWT
export const createReadList = async (data: ReadListCreateInput): Promise<ReadList> => {
  return withErrorHandling(async () => {
    const response = await post<{success: boolean, data: ReadList, message: string}>('/readlists', data);
    if (!response || !response.data) throw new Error('Failed to create read list');
    return response.data;
  }, 'creating read list');
};

export const getPublicReadLists = async (): Promise<ReadList[]> => {
  return withErrorHandling(async () => {
    const response = await get<ReadList[]>('/readlists');
    return response || [];
  }, 'fetching public read lists');
};

// Get a specific read list by ID
export const getReadList = async (id: number): Promise<ReadList> => {
  return withErrorHandling(async () => {
    const response = await get<ReadList>(`/readlists/${id}`);
    if (!response) throw new Error('Read list not found');
    return response;
  }, 'fetching read list');
};


// Update a read list - NOUVEAU: utiliser JWT
export const updateReadList = async (
  id: number,
  data: ReadListUpdateInput
): Promise<ReadList> => {
  return withErrorHandling(async () => {
    const response = await put<ReadList>(`/readlists/${id}`, data);
    if (!response) throw new Error('Failed to update read list');
    return response;
  }, 'updating read list');
};

// Delete a read list - NOUVEAU: utiliser JWT
export const deleteReadList = async (id: number): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`/readlists/${id}`);
  }, 'deleting read list');
};

// Get items from a read list
export const getReadListItems = async (listId: number): Promise<{success: boolean, data: ReadListItem[], message?: string}> => {
  return withErrorHandling(async () => {
    const response = await get<{success: boolean, data: ReadListItem[], message?: string}>(`/readlists/${listId}/items`);
    return response || {success: true, data: []};
  }, 'fetching read list items');
};

// Add an item to a read list - NOUVEAU: utiliser JWT
export const addItemToReadList = async (
  listId: number,
  item: ReadListItemCreateInput
): Promise<ReadListItem> => {
  return withErrorHandling(async () => {
    const response = await post<ReadListItem>(`/readlists/${listId}/items`, item);
    if (!response) throw new Error('Failed to add item to read list');
    return response;
  }, 'adding item to read list');
};

// Update a read list item - NOUVEAU: utiliser JWT
export const updateReadListItem = async (
  itemId: number,
  data: ReadListItemUpdateInput
): Promise<ReadListItem> => {
  return withErrorHandling(async () => {
    const response = await put<ReadListItem>(`/readlists/items/${itemId}`, data);
    if (!response) throw new Error('Failed to update read list item');
    return response;
  }, 'updating read list item');
};

// Delete a read list item - NOUVEAU: utiliser JWT
export const deleteReadListItem = async (itemId: number): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`/readlists/items/${itemId}`);
  }, 'deleting read list item');
};

// ============================================
// API POUR LES READ LISTS PUBLIQUES
// ============================================

// Get public read lists with pagination
export const getPublicReadListsPaginated = async (params?: PublicReadListQueryParams): Promise<PublicReadListsResponse> => {
  return withErrorHandling(async () => {
    const response = await get<PublicReadListsResponse>('/readlists/public', params as Record<string, unknown>);
    if (!response) {
      return {
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0
        }
      };
    }
    return response;
  }, 'fetching public read lists');
};

// Copy a public read list
export const copyPublicReadList = async (readListId: number): Promise<ReadListCopyResponse> => {
  return withErrorHandling(async () => {
    return await post<ReadListCopyResponse>(`/readlists/copy/${readListId}`, {});
  }, 'copying public read list');
}; 