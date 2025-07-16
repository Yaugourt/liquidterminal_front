import { post, get, del } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
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

/**
 * Adds a new wallet to the user's account
 * @param address The wallet address
 * @param name Optional name for the wallet
 * @param privyUserId The user's Privy ID
 * @returns The wallet response
 */
export const addWallet = async (
  address: string,
  name?: string,
  privyUserId?: string
): Promise<AddWalletResponse> => {
  return withErrorHandling(async () => {
    const response = await post<any>('/wallet', {
      address,
      name,
      privyUserId
    });
    
    // Vérifier si la réponse indique un succès
    if (response && response.success === true) {
      // Si la réponse contient les données attendues
      if (response.wallet && response.userWallet) {
        return {
          success: true,
          wallet: response.wallet,
          userWallet: response.userWallet
        };
      }
      
      // Si la réponse contient seulement userWallet
      if (response.userWallet) {
        // Créer un wallet à partir des données de userWallet
        const userWallet = response.userWallet;
        const wallet = {
          id: userWallet.walletId || 0,
          address: address,
          name: userWallet.name || name || `Wallet ${userWallet.id}`,
          addedAt: userWallet.addedAt || new Date()
        };
        
        return {
          success: true,
          wallet: wallet,
          userWallet: userWallet
        };
      }
      
      // Si la réponse contient seulement un message de succès
      return {
        success: true,
        message: response.message || "Wallet ajouté avec succès"
      };
    }
    
    // Si la réponse n'indique pas un succès
    console.error("Invalid response format from addWallet:", response);
    return {
      success: false,
      message: response.message || "Invalid response format from server"
    };
  }, 'adding wallet');
};

/**
 * Gets all wallets for a user
 * @param privyUserId The user's Privy ID
 * @returns Array of user wallets
 */
export const getWalletsByUser = async (
  privyUserId: string
): Promise<WalletResponse> => {
  return withErrorHandling(async () => {
    const response = await get<any>(`/wallet/user/${privyUserId}`);
    
    // Vérifier que la réponse contient les données attendues
    if (!response) {
      console.error("Invalid response format from getWalletsByUser:", response);
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
    
    console.error("Unexpected response format:", response);
    return {
      data: []
    };
  }, 'fetching wallets');
};

/**
 * Deletes a wallet from the user's account
 * @param walletId The ID of the wallet to delete
 * @returns Promise that resolves when the wallet is deleted
 */
export const deleteWallet = async (walletId: string): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`/wallet/${walletId}`);
  }, 'deleting wallet');
};

/**
 * Removes a wallet association from a user
 * @param privyUserId The user's Privy ID
 * @param walletId The ID of the wallet to remove from the user
 * @returns Promise that resolves when the wallet is removed from the user
 */
export const removeWalletFromUser = async (privyUserId: number, walletId: number): Promise<void> => {
  return withErrorHandling(async () => {
    await del(`/wallet/user/${privyUserId}/wallet/${walletId}`);
  }, 'removing wallet from user');
}; 