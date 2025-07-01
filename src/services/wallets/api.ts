import axios from 'axios';
import { API_URLS } from '../api/base';
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
  try {
  
    const response = await axios.post(`${API_URLS.LOCAL_BACKEND}/wallet`, {
      address,
      name,
      privyUserId
    });
    

    
    // Vérifier si la réponse indique un succès
    if (response.data && response.data.success === true) {
      // Si la réponse contient les données attendues
      if (response.data.wallet && response.data.userWallet) {
        return {
          success: true,
          wallet: response.data.wallet,
          userWallet: response.data.userWallet
        };
      }
      
      // Si la réponse contient seulement userWallet
      if (response.data.userWallet) {
        // Créer un wallet à partir des données de userWallet
        const userWallet = response.data.userWallet;
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
        message: response.data.message || "Wallet ajouté avec succès"
      };
    }
    
    // Si la réponse n'indique pas un succès
    console.error("Invalid response format from addWallet:", response.data);
    return {
      success: false,
      message: response.data.message || "Invalid response format from server"
    };
  } catch (error: any) {
    console.error('Error adding wallet:', error);
    
    if (error.response) {
      // Propager l'erreur avec le statut HTTP et le message
      throw {
        message: error.response.data.message || 'Failed to add wallet',
        response: {
          status: error.response.status,
          data: error.response.data
        }
      };
    }
    
    throw error;
  }
};

/**
 * Gets all wallets for a user
 * @param privyUserId The user's Privy ID
 * @returns Array of user wallets
 */
export const getWalletsByUser = async (
  privyUserId: string
): Promise<WalletResponse> => {
  try {
  
    const response = await axios.get(`${API_URLS.LOCAL_BACKEND}/wallet/user/${privyUserId}`);
  
    
    // Vérifier que la réponse contient les données attendues
    if (!response.data) {
      console.error("Invalid response format from getWalletsByUser:", response.data);
      return {
        data: []
      };
    }
    
    // Vérifier si la réponse contient une structure paginée
    if (response.data.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data
      };
    }
    
    // Si la réponse est directement un tableau
    if (Array.isArray(response.data)) {
      return {
        data: response.data
      };
    }
    
    console.error("Unexpected response format:", response.data);
    return {
      data: []
    };
  } catch (error: any) {
    console.error('Error fetching wallets:', error);
    throw error;
  }
};

/**
 * Deletes a wallet from the user's account
 * @param walletId The ID of the wallet to delete
 * @returns Promise that resolves when the wallet is deleted
 */
export const deleteWallet = async (walletId: string): Promise<void> => {
  try {
  
    const response = await axios.delete(`${API_URLS.LOCAL_BACKEND}/wallet/${walletId}`);
  
  } catch (error: any) {
    console.error('Error deleting wallet:', error);
    
    // Propager l'erreur avec le statut HTTP et le message
    if (error.response) {
      throw {
        message: error.response.data.message || 'Failed to delete wallet',
        response: {
          status: error.response.status,
          data: error.response.data
        }
      };
    }
    
    throw error;
  }
};

/**
 * Removes a wallet association from a user
 * @param privyUserId The user's Privy ID
 * @param walletId The ID of the wallet to remove from the user
 * @returns Promise that resolves when the wallet is removed from the user
 */
export const removeWalletFromUser = async (privyUserId: number, walletId: number): Promise<void> => {
  try {
  
    const response = await axios.delete(`${API_URLS.LOCAL_BACKEND}/wallet/user/${privyUserId}/wallet/${walletId}`);
  
  } catch (error: any) {
    console.error('Error removing wallet from user:', error);
    
    // Propager l'erreur avec le statut HTTP et le message
    if (error.response) {
      throw {
        message: error.response.data.message || 'Failed to remove wallet from user',
        response: {
          status: error.response.status,
          data: error.response.data
        }
      };
    }
    
    throw error;
  }
}; 