import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Wallet, UserWallet, WalletsState } from "../services/market/tracker/types";
import { addWallet, bulkAddWallets as apiBulkAddWallets, bulkDeleteWallets as apiBulkDeleteWallets, getWalletsByUser, removeWalletFromUser } from "../services/market/tracker/api";
import { AuthService } from "../services/auth";
import { handleApiError, createOrderManager, validateWalletAddress, validateName, processWalletsResponse } from './utils';
import { handleWalletApiError } from '../lib/toast-messages/wallet';
import { InitializeParams } from './types';
import { toast } from 'sonner';






// Action creators for better state management
const createActionCreators = (set: (fn: (state: WalletsState) => Partial<WalletsState>) => void) => ({
  setLoading: (loading: boolean) => set((state) => ({ loading, error: loading ? null : state.error })),
  setError: (error: string | null) => set(() => ({ error, loading: false })),
  updateWallets: (updater: (wallets: Wallet[]) => Wallet[]) => 
    set((state: WalletsState) => ({ wallets: updater(state.wallets) })),
  updateUserWallets: (updater: (userWallets: UserWallet[]) => UserWallet[]) => 
    set((state: WalletsState) => ({ userWallets: updater(state.userWallets) })),
  setActiveWallet: (id: number | null) => 
    set(() => ({ activeWalletId: id }))
});

export const useWallets = create<WalletsState>()(
  persist(
    (set, get) => {
      const actions = createActionCreators(set);
      const orderManager = createOrderManager<Wallet>('wallets', (wallet) => wallet.id);
      
      // Fonction commune pour mettre à jour les wallets
      const updateWalletsState = (wallets: unknown[], userWallets: UserWallet[]) => {
        const orderedWallets = orderManager.restoreOrder(wallets as Wallet[]);
        const currentActiveId = get().activeWalletId;
        const hasValidActiveWallet = orderedWallets.some(w => w.id === currentActiveId);
        
        actions.updateWallets(() => orderedWallets);
        actions.updateUserWallets(() => userWallets);
        actions.setActiveWallet(hasValidActiveWallet ? currentActiveId : (orderedWallets.length > 0 ? orderedWallets[0].id : null));
        actions.setLoading(false);
      };
      
      return {
        wallets: [],
        userWallets: [],
        activeWalletId: null,
        loading: false,
        error: null,
        
        initialize: async ({ privyUserId, username, privyToken }: InitializeParams): Promise<void> => {
          try {
            actions.setLoading(true);
      
            const authService = AuthService.getInstance();
            const isInitialized = await authService.ensureUserInitialized(privyUserId, username, privyToken);
            if (!isInitialized) {
              throw new Error("Failed to initialize user in database");
            }
            
            const response = await getWalletsByUser();
            const { wallets, userWallets } = processWalletsResponse(response);
            
            updateWalletsState(wallets, userWallets as UserWallet[]);
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to initialize wallets'));
          }
        },
        
        reloadWallets: async (): Promise<void> => {
          try {
            actions.setLoading(true);
            
            const response = await getWalletsByUser();
            const { wallets, userWallets } = processWalletsResponse(response);
            
            updateWalletsState(wallets, userWallets as UserWallet[]);
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to reload wallets'));
          }
        },
        
        addWallet: async (address: string, name?: string, walletListId?: number): Promise<Wallet | void> => {
          try {
            actions.setLoading(true);
            
            const normalizedAddress = validateWalletAddress(address);
            if (name) validateName(name, { maxLength: 255, fieldName: 'Wallet name' });
            
            const walletName = name || `Wallet ${get().wallets.length + 1}`;
            const response = await addWallet(normalizedAddress, walletName, walletListId);
            
            if (response.success === true) {
              await get().reloadWallets();
              return;
            }
            
            throw new Error("Failed to add wallet");
          } catch (error) {
            // Utiliser handleWalletApiError pour gérer les erreurs spécifiques aux wallets
            handleWalletApiError(error);
            throw error; // Re-throw pour que le composant puisse gérer l'erreur
          } finally {
            actions.setLoading(false);
          }
        },
        
        bulkAddWallets: async (
          wallets: Array<{ address: string; name?: string }>,
          walletListId?: number
        ): Promise<{ total: number; added: number; skipped: number; errors: Array<{ address: string; reason: string }> }> => {
          try {
            actions.setLoading(true);
            
            // Validate all addresses
            const validatedWallets: Array<{ address: string; name?: string }> = [];
            
            for (const w of wallets) {
              try {
                const validatedAddress = validateWalletAddress(w.address);
                validatedWallets.push({
                  address: validatedAddress,
                  name: w.name
                });
              } catch {
                // Skip invalid addresses
              }
            }
            
            if (validatedWallets.length === 0) {
              throw new Error("No valid wallets to import");
            }
            
            const response = await apiBulkAddWallets(validatedWallets, walletListId);
            
            if (response.success && response.data) {
              // Reload wallets to reflect the new additions
              await get().reloadWallets();
              
              // Show success toast
              const { added, skipped, errors } = response.data;
              if (added > 0) {
                toast.success(`Successfully imported ${added} wallet${added !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped)` : ''}`);
              }
              if (errors.length > 0) {
                toast.error(`${errors.length} wallet${errors.length !== 1 ? 's' : ''} failed to import`);
              }
              
              return response.data;
            }
            
            throw new Error(response.message || "Failed to bulk add wallets");
          } catch (error) {
            handleWalletApiError(error);
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        bulkDeleteWallets: async (
          walletIds: number[]
        ): Promise<{ total: number; deleted: number; failed: number; errors: Array<{ walletId: number; reason: string }> }> => {
          try {
            actions.setLoading(true);
            
            if (walletIds.length === 0) {
              throw new Error("No wallets selected for deletion");
            }
            
            const response = await apiBulkDeleteWallets(walletIds);
            
            if (response.success && response.data) {
              // Reload wallets to reflect the deletions
              await get().reloadWallets();
              
              // Show success toast
              const { deleted, failed, errors } = response.data;
              if (deleted > 0) {
                toast.success(`Successfully deleted ${deleted} wallet${deleted !== 1 ? 's' : ''}`);
              }
              if (failed > 0 || errors.length > 0) {
                toast.error(`${failed} wallet${failed !== 1 ? 's' : ''} failed to delete`);
              }
              
              return response.data;
            }
            
            throw new Error(response.message || "Failed to bulk delete wallets");
          } catch (error) {
            handleWalletApiError(error);
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        removeWallet: async (id: number): Promise<void> => {
          try {
            actions.setLoading(true);
            
            const userWallets = get().userWallets;
            const userWallet = userWallets.find(uw => {
              if (uw.wallet && typeof uw.wallet === 'object' && 'id' in uw.wallet) {
                return uw.wallet.id === id;
              }
              return uw.walletId === id;
            });
            
            if (!userWallet) {
              throw new Error("Wallet not found in user's wallets");
            }
            
            await removeWalletFromUser(id);
            
            await get().reloadWallets();
          } catch (error) {
            const errorMessage = handleApiError(error, 'Failed to remove wallet');
            actions.setError(errorMessage);
            throw error; // Re-throw pour que le composant puisse gérer l'erreur
          }
        },
        
        setActiveWallet: (id: number | null) => {
          if (id === null) {
            actions.setActiveWallet(null);
            return;
          }
          const wallet = get().wallets.find(w => w.id === id);
          if (wallet) {
            actions.setActiveWallet(id);
          }
        },
        
        reorderWallets: (newOrder: number[]) => {
          const currentWallets = get().wallets;
          const reorderedWallets = newOrder
            .map(id => currentWallets.find(wallet => wallet.id === id))
            .filter((wallet): wallet is Wallet => wallet !== undefined);
          
          actions.updateWallets(() => reorderedWallets);
          orderManager.saveOrder(reorderedWallets);
        },
        
        getActiveWallet: () => {
          const { wallets, activeWalletId } = get();
          return wallets.find(wallet => wallet.id === activeWalletId);
        }
      };
    },
    {
      name: "wallets-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wallets: state.wallets,
        userWallets: state.userWallets,
        activeWalletId: state.activeWalletId
      })
    }
  )
); 