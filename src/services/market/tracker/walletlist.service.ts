import { get, post, put, del, patch as patch_ } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { 
  WalletList,
  WalletListItem,
  WalletListResponse,
  CreateWalletListInput,
  UpdateWalletListInput,
  CreateWalletListItemInput
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
      `${BASE_URL}/userlists`, 
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
    const response = await get<{ success: boolean; data: WalletList }>(
      `${BASE_URL}/${id}`,
      {},
      { useCache: false }
    );
    if (!response || !response.data) {
      throw new Error('Wallet list not found');
    }
    return response.data;
  }, 'fetching wallet list');
};

/**
 * Crée une nouvelle liste de wallets
 */
export const createWalletList = async (data: CreateWalletListInput): Promise<WalletList & { xpGranted?: number }> => {
  return withErrorHandling(async () => {
    const response = await post<{ success: boolean; data: WalletList; xpGranted?: number }>(BASE_URL, data);
    if (!response || !response.data) {
      throw new Error('Failed to create wallet list');
    }
    return { ...response.data, xpGranted: response.xpGranted };
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
    const response = await put<{ success: boolean; data: WalletList }>(`${BASE_URL}/${id}`, data);
    if (!response || !response.data) {
      throw new Error('Failed to update wallet list');
    }
    return response.data;
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
    const response = await post<{ success: boolean; data: WalletList }>(`${BASE_URL}/${id}/copy`);
    if (!response || !response.data) {
      throw new Error('Failed to copy wallet list');
    }
    return response.data;
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
      { useCache: false, retryOnError: false }
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
): Promise<WalletListItem & { xpGranted?: number }> => {
  return withErrorHandling(async () => {
    const response = await post<{ success: boolean; data: WalletListItem; xpGranted?: number }>(`${BASE_URL}/${listId}/items`, data);
    if (!response || !response.data) {
      throw new Error('Failed to add wallet to list');
    }
    return { ...response.data, xpGranted: response.xpGranted };
  }, 'adding wallet to list');
};

/**
 * Supprime un wallet d'une liste
 */
export const removeWalletFromList = async (itemId: number): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`${BASE_URL}/items/${itemId}`);
  }, 'removing wallet from list');
};

// ========== TELEGRAM ALERTS ON A LIST ==========

export type ListAlertDirection = 'OPEN' | 'CLOSE' | 'FLIP' | null;
export type ListAlertSource = 'PERP' | 'SPOT' | null;

export interface ListAlertSettings {
  minUsd: number;
  direction: ListAlertDirection;
  source: ListAlertSource;
  isActive: boolean;
}

export interface ListAlert extends ListAlertSettings {
  walletListId: number;
  listName: string;
  isOwner: boolean;
  isPublic: boolean;
  walletCount: number;
  /** false when the alert was deleted from the bot; saving recreates it. */
  inTelegram: boolean;
  createdAt: string;
}

export interface ListAlertsState {
  telegram: { linked: boolean; username: string | null };
  alerts: ListAlert[];
}

/** Telegram alerts the user has on lists (own or public), and their link state. */
export const getListAlerts = async (): Promise<ListAlertsState> => {
  return withErrorHandling(async () => {
    const response = await get<{ success: boolean; data: ListAlertsState }>(`${BASE_URL}/alerts`, undefined, { useCache: false });
    return response.data;
  }, 'fetching list alerts');
};

/** Turn Telegram alerts on for a list, or update their settings. */
export const saveListAlert = async (listId: number, settings: ListAlertSettings): Promise<ListAlert> => {
  return withErrorHandling(async () => {
    const response = await put<{ success: boolean; data: ListAlert }>(`${BASE_URL}/${listId}/alert`, settings);
    return response.data;
  }, 'saving list alert');
};

/** Turn Telegram alerts off for a list. */
export const deleteListAlert = async (listId: number): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`${BASE_URL}/${listId}/alert`);
  }, 'removing list alert');
};

// ========== GENERIC ALERT RULES (price, market, liquidation cascades) ==========

export type AlertRuleType =
  | 'price_cross'
  | 'price_move'
  | 'funding'
  | 'oi_surge'
  | 'listing'
  | 'leverage'
  | 'liq_cascade'
  | 'reserve_yield';

export interface AlertRule {
  id: string;
  type: AlertRuleType;
  name: string;
  params: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

export interface AlertRulesState {
  telegram: { linked: boolean; username: string | null };
  limit: number;
  rules: AlertRule[];
}

/** The user's alert rules and their Telegram link state. */
export const getAlertRules = async (): Promise<AlertRulesState> => {
  return withErrorHandling(async () => {
    const response = await get<{ success: boolean; data: AlertRulesState }>('/alerts/rules', undefined, { useCache: false });
    return response.data;
  }, 'fetching alert rules');
};

/** Create an alert rule; params are validated per type by the API. */
export const createAlertRule = async (type: AlertRuleType, params: Record<string, unknown>, name?: string): Promise<AlertRule> => {
  return withErrorHandling(async () => {
    const response = await post<{ success: boolean; data: AlertRule }>('/alerts/rules', { type, params, ...(name ? { name } : {}) });
    return response.data;
  }, 'creating alert rule');
};

/** Pause, resume, rename or retune an alert rule. */
export const updateAlertRule = async (id: string, patch: { isActive?: boolean; name?: string; params?: Record<string, unknown> }): Promise<AlertRule> => {
  return withErrorHandling(async () => {
    const response = await patch_<{ success: boolean; data: AlertRule }>(`/alerts/rules/${id}`, patch);
    return response.data;
  }, 'updating alert rule');
};

/** Delete an alert rule. */
export const deleteAlertRule = async (id: string): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`/alerts/rules/${id}`);
  }, 'deleting alert rule');
};
