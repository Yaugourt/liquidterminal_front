import { post, get, del } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { 
  AddWalletResponse, 
  WalletResponse
} from './types';
import { 
  fetchHyperliquidBalances, 
  fetchHyperliquidPerpPositions 
} from './hyperliquid.service';

// Réexporter les fonctions du service Hyperliquid
export { fetchHyperliquidBalances, fetchHyperliquidPerpPositions };

// Réexporter les fonctions du service WalletList
export * from './walletlist.service';

/**
 * Adds a new wallet to the user's account - NOUVEAU: utiliser JWT
 * @param address The wallet address
 * @param name Optional name for the wallet
 * @param walletListId Optional ID of the wallet list to add the wallet to
 * @returns The wallet response
 */
export const addWallet = async (
  address: string,
  name?: string,
  walletListId?: number
): Promise<AddWalletResponse> => {
  return withErrorHandling(async () => {
    const payload: { address: string; name?: string; walletListId?: number } = {
      address,
      name
    };
    
    // Ajouter walletListId seulement s'il est fourni
    if (walletListId !== undefined) {
      payload.walletListId = walletListId;
    }
    
    const response = await post<AddWalletResponse>('/wallet', payload);
    
    // Vérifier si la réponse indique un succès
    if (response && response.success === true) {
      // Si la réponse contient userWallet
      if (response.userWallet) {
        return {
          success: true,
          userWallet: response.userWallet,
          xpGranted: response.xpGranted // Pass through XP if backend sends it
        };
      }
      
      // Si la réponse contient seulement un message de succès
      return {
        success: true,
        message: response.message || "Wallet ajouté avec succès",
        xpGranted: response.xpGranted
      };
    }
    
    // Si la réponse n'indique pas un succès
    return {
      success: false,
      message: response.message || "Invalid response format from server"
    };
  }, 'adding wallet');
};

/**
 * Gets all wallets for the current user - NOUVEAU: utiliser JWT
 * @returns Array of user wallets
 */
export const getWalletsByUser = async (): Promise<WalletResponse> => {
  return withErrorHandling(async () => {
    // NOUVEAU: utiliser /my-wallets au lieu de /user/:privyUserId
    // Désactiver le cache pour toujours avoir les données fraîches
    const response = await get<WalletResponse>('/wallet/my-wallets', {}, { useCache: false });
    
    // Vérifier que la réponse contient les données attendues
    if (!response) {
      return {
        data: []
      };
    }
    
    // Vérifier si la réponse contient une structure paginée
    if (response.data && Array.isArray(response.data)) {
      return {
        data: response.data
      };
    }
    
    // Si la réponse est directement un tableau
    if (Array.isArray(response)) {
      return {
        data: response
      };
    }
    
    return {
      data: []
    };
  }, 'fetching wallets');
};

/**
 * Deletes a wallet from the user's account - NOUVEAU: utiliser JWT
 * @param walletId The ID of the wallet to delete
 * @returns Promise that resolves when the wallet is deleted
 */
export const deleteWallet = async (walletId: string): Promise<void> => {
  return withErrorHandling(async () => {
    // NOUVEAU: utiliser /:id au lieu de /user/:userId/wallet/:walletId
    await del(`/wallet/${walletId}`);
  }, 'deleting wallet');
};

/**
 * Removes a wallet association from a user - NOUVEAU: utiliser JWT
 * @param walletId The ID of the wallet to remove from the user
 * @returns Promise that resolves when the wallet is removed from the user
 */
export const removeWalletFromUser = async (walletId: number): Promise<void> => {
  return withErrorHandling(async () => {
    // NOUVEAU: utiliser /:id au lieu de /user/:userId/wallet/:walletId
    await del(`/wallet/${walletId}`);
  }, 'removing wallet from user');
};

/**
 * Bulk add wallets via CSV import
 * @param wallets Array of wallets to add
 * @param walletListId Optional ID of the wallet list to add all wallets to
 * @returns Response with success stats (total, added, skipped, errors)
 */
export const bulkAddWallets = async (
  wallets: Array<{ address: string; name?: string }>,
  walletListId?: number
): Promise<{
  success: boolean;
  data?: {
    total: number;
    added: number;
    skipped: number;
    errors: Array<{ address: string; reason: string }>;
  };
  message?: string;
}> => {
  return withErrorHandling(async () => {
    const payload: {
      wallets: Array<{ address: string; name?: string }>;
      walletListId?: number;
    } = { wallets };
    
    if (walletListId !== undefined) {
      payload.walletListId = walletListId;
    }
    
    const response = await post<{
      success: boolean;
      data?: {
        total: number;
        added: number;
        skipped: number;
        errors: Array<{ address: string; reason: string }>;
      };
      message?: string;
    }>('/wallet/bulk-add', payload);
    
    return response;
  }, 'bulk adding wallets');
};

/**
 * Bulk delete wallets
 * @param walletIds Array of wallet IDs to delete
 * @returns Response with success stats (total, deleted, failed, errors)
 */
export const bulkDeleteWallets = async (
  walletIds: number[]
): Promise<{
  success: boolean;
  data?: {
    total: number;
    deleted: number;
    failed: number;
    errors: Array<{ walletId: number; reason: string }>;
  };
  message?: string;
}> => {
  return withErrorHandling(async () => {
    const response = await post<{
      success: boolean;
      data?: {
        total: number;
        deleted: number;
        failed: number;
        errors: Array<{ walletId: number; reason: string }>;
      };
      message?: string;
    }>('/wallet/bulk-delete', { walletIds });
    
    return response;
  }, 'bulk deleting wallets');
}; 