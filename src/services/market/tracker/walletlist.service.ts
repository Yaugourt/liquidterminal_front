import { get, post, put, del } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { 
  WalletList,
  WalletListItem,
  WalletListResponse,
  CreateWalletListInput,
  UpdateWalletListInput,
  CreateWalletListItemInput,
  UpdateWalletListItemInput
} from './types';

/**
 * Service pour la gestion des listes de wallets
 * Utilise JWT authentication comme les autres services tracker
 */

const BASE_URL = '/walletlists';

/**
 * Récupère toutes les listes publiques
 */
export const getPublicWalletLists = async (params?: { 
  page?: number; 
  limit?: number; 
  search?: string 
}): Promise<WalletListResponse> => {
  return withErrorHandling(async () => {
    const response = await get<WalletListResponse>(
      `${BASE_URL}/public`, 
      params,
      { useCache: false }
    );
    return response || { data: [] };
  }, 'fetching public wallet lists');
};

/**
 * Récupère toutes les listes de l'utilisateur connecté
 */
export const getUserWalletLists = async (params?: { 
  page?: number; 
  limit?: number; 
  search?: string 
}): Promise<WalletListResponse> => {
  return withErrorHandling(async () => {
    const response = await get<WalletListResponse>(
      BASE_URL, 
      params,
      { useCache: false }
    );
    return response || { data: [] };
  }, 'fetching user wallet lists');
};

/**
 * Récupère une liste spécifique par ID
 */
export const getWalletListById = async (id: number): Promise<WalletList> => {
  return withErrorHandling(async () => {
    const response = await get<WalletList>(
      `${BASE_URL}/${id}`,
      {},
      { useCache: false }
    );
    if (!response) {
      throw new Error('Wallet list not found');
    }
    return response;
  }, 'fetching wallet list');
};

/**
 * Crée une nouvelle liste de wallets
 */
export const createWalletList = async (data: CreateWalletListInput): Promise<WalletList> => {
  return withErrorHandling(async () => {
    const response = await post<WalletList>(BASE_URL, data);
    if (!response) {
      throw new Error('Failed to create wallet list');
    }
    return response;
  }, 'creating wallet list');
};

/**
 * Met à jour une liste de wallets
 */
export const updateWalletList = async (
  id: number, 
  data: UpdateWalletListInput
): Promise<WalletList> => {
  return withErrorHandling(async () => {
    const response = await put<WalletList>(`${BASE_URL}/${id}`, data);
    if (!response) {
      throw new Error('Failed to update wallet list');
    }
    return response;
  }, 'updating wallet list');
};

/**
 * Supprime une liste de wallets
 */
export const deleteWalletList = async (id: number): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`${BASE_URL}/${id}`);
  }, 'deleting wallet list');
};

/**
 * Copie une liste de wallets
 */
export const copyWalletList = async (id: number): Promise<WalletList> => {
  return withErrorHandling(async () => {
    const response = await post<WalletList>(`${BASE_URL}/${id}/copy`);
    if (!response) {
      throw new Error('Failed to copy wallet list');
    }
    return response;
  }, 'copying wallet list');
};

/**
 * Récupère les items d'une liste
 */
export const getWalletListItems = async (
  listId: number,
  params?: { page?: number; limit?: number; search?: string }
): Promise<{ data: WalletListItem[]; pagination?: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrevious: boolean } }> => {
  return withErrorHandling(async () => {
    const response = await get<{
      data: WalletListItem[];
      pagination?: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrevious: boolean } 
    }>(
      `${BASE_URL}/${listId}/items`, 
      params,
      { useCache: false }
    );
    return response || { data: [] };
  }, 'fetching wallet list items');
};

/**
 * Ajoute un wallet à une liste
 */
export const addWalletToList = async (
  listId: number, 
  data: CreateWalletListItemInput
): Promise<WalletListItem> => {
  return withErrorHandling(async () => {
    const response = await post<WalletListItem>(`${BASE_URL}/${listId}/items`, data);
    if (!response) {
      throw new Error('Failed to add wallet to list');
    }
    return response;
  }, 'adding wallet to list');
};

/**
 * Met à jour un item de liste
 */
export const updateWalletListItem = async (
  itemId: number, 
  data: UpdateWalletListItemInput
): Promise<WalletListItem> => {
  return withErrorHandling(async () => {
    const response = await put<WalletListItem>(`${BASE_URL}/items/${itemId}`, data);
    if (!response) {
      throw new Error('Failed to update wallet list item');
    }
    return response;
  }, 'updating wallet list item');
};

/**
 * Supprime un wallet d'une liste
 */
export const removeWalletFromList = async (itemId: number): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`${BASE_URL}/items/${itemId}`);
  }, 'removing wallet from list');
};
