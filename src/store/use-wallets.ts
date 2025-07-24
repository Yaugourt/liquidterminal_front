import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Wallet, UserWallet, WalletsState } from "../services/wallets/types";
import { addWallet, getWalletsByUser, removeWalletFromUser } from "../services/wallets/api";
import { AuthService } from "../services/auth";

interface InitializeParams {
  privyUserId: string;
  username: string;
  privyToken: string;
}

// Utility functions
const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as any).response;
    switch (response?.status) {
      case 409: return 'This wallet already exists in your account';
      case 400: return 'Invalid wallet address or name';
      case 404: return 'Wallet not found';
      case 403: return 'Access denied';
      default: return defaultMessage;
    }
  }
  return defaultMessage;
};

const validateWalletAddress = (address: string): string => {
  if (!address?.trim()) {
    throw new Error("Address is required");
  }
  
  const normalizedAddress = address.toLowerCase().trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
    throw new Error("Invalid wallet address format");
  }
  
  return normalizedAddress;
};

const validateWalletName = (name?: string): void => {
  if (name && name.length > 255) {
    throw new Error("Wallet name is too long");
  }
};

const parseUserWallet = (uw: UserWallet): Wallet | null => {
  // Si nous avons un objet wallet complet
  if (uw.wallet && typeof uw.wallet === 'object') {
    return {
      id: uw.wallet.id,
      address: uw.wallet.address || uw.address || '',
      name: uw.wallet.name || uw.name || `Wallet ${uw.id}`,
      addedAt: uw.wallet.addedAt || uw.addedAt || new Date()
    };
  }
  
  // Si nous n'avons que les informations de base
  return {
    id: uw.walletId,
    address: uw.address || '',
    name: uw.name || `Wallet ${uw.id}`,
    addedAt: uw.addedAt || new Date()
  };
};

const processWalletsResponse = (response: any): { wallets: Wallet[], userWallets: UserWallet[] } => {
  if (!response?.data || !Array.isArray(response.data)) {
    throw new Error("Invalid response format from server");
  }
  
  const userWallets = response.data;
  const wallets = userWallets
    .map(parseUserWallet)
    .filter((wallet: Wallet | null): wallet is Wallet => {
      const isValid = wallet !== null && 
        typeof wallet.id === 'number' &&
        typeof wallet.name === 'string';
      
      return isValid;
    });
  
  return { wallets, userWallets };
};

// Action creators for better state management
const createActionCreators = (set: any, get: any) => ({
  setLoading: (loading: boolean) => set({ loading, error: loading ? null : get().error }),
  setError: (error: string | null) => set({ error, loading: false }),
  updateWallets: (updater: (wallets: Wallet[]) => Wallet[]) => 
    set((state: any) => ({ wallets: updater(state.wallets) })),
  updateUserWallets: (updater: (userWallets: UserWallet[]) => UserWallet[]) => 
    set((state: any) => ({ userWallets: updater(state.userWallets) })),
  setActiveWallet: (id: number | null) => set({ activeWalletId: id })
});

export const useWallets = create<WalletsState>()(
  persist(
    (set, get) => {
      const actions = createActionCreators(set, get);
      
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
            
            // Restaurer l'ordre sauvegardé si disponible
            let orderedWallets = wallets;
            try {
              const savedOrder = localStorage.getItem('wallets-order');
              if (savedOrder) {
                const orderIds = JSON.parse(savedOrder) as number[];
                const savedWallets = orderIds
                  .map(id => wallets.find(wallet => wallet.id === id))
                  .filter((wallet): wallet is Wallet => wallet !== undefined);
                
                // Ajouter les nouveaux wallets qui ne sont pas dans l'ordre sauvegardé
                const newWallets = wallets.filter(wallet => !orderIds.includes(wallet.id));
                orderedWallets = [...savedWallets, ...newWallets];
              }
            } catch (error) {
              console.warn('Failed to restore wallets order from localStorage:', error);
            }
            
            // Ensure we have a valid active wallet
            const currentActiveId = get().activeWalletId;
            const hasValidActiveWallet = orderedWallets.some(w => w.id === currentActiveId);
            
            set({
              wallets: orderedWallets,
              userWallets,
              activeWalletId: hasValidActiveWallet ? currentActiveId : (orderedWallets.length > 0 ? orderedWallets[0].id : null),
              loading: false
            });
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to initialize wallets'));
          }
        },
        
        reloadWallets: async (): Promise<void> => {
          try {
            actions.setLoading(true);
            
            const response = await getWalletsByUser();
            const { wallets, userWallets } = processWalletsResponse(response);
            
            // Restaurer l'ordre sauvegardé si disponible
            let orderedWallets = wallets;
            try {
              const savedOrder = localStorage.getItem('wallets-order');
              if (savedOrder) {
                const orderIds = JSON.parse(savedOrder) as number[];
                const savedWallets = orderIds
                  .map(id => wallets.find(wallet => wallet.id === id))
                  .filter((wallet): wallet is Wallet => wallet !== undefined);
                
                // Ajouter les nouveaux wallets qui ne sont pas dans l'ordre sauvegardé
                const newWallets = wallets.filter(wallet => !orderIds.includes(wallet.id));
                orderedWallets = [...savedWallets, ...newWallets];
              }
            } catch (error) {
              console.warn('Failed to restore wallets order from localStorage:', error);
            }
            
            // Ensure we have a valid active wallet
            const currentActiveId = get().activeWalletId;
            const hasValidActiveWallet = orderedWallets.some(w => w.id === currentActiveId);
            
            set({
              wallets: orderedWallets,
              userWallets,
              activeWalletId: hasValidActiveWallet ? currentActiveId : (orderedWallets.length > 0 ? orderedWallets[0].id : null),
              loading: false
            });
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to reload wallets'));
          }
        },
        
        addWallet: async (address: string, name?: string): Promise<Wallet | void> => {
          try {
            actions.setLoading(true);
            
            const normalizedAddress = validateWalletAddress(address);
            validateWalletName(name);
            
            const walletName = name || `Wallet ${get().wallets.length + 1}`;
            const response = await addWallet(normalizedAddress, walletName);
            
            // Si la réponse indique un succès
            if (response.success === true) {
              // Si on a les objets wallet et userWallet
              if (response.wallet && response.userWallet) {
                const newWallet = {
                  ...response.wallet,
                  name: response.wallet.name || walletName
                };
                const newUserWallet = response.userWallet;
                
                // Ajouter le nouveau wallet en respectant l'ordre sauvegardé
                const currentWallets = get().wallets;
                let newWallets = [...currentWallets, newWallet];
                
                // Vérifier s'il y a un ordre sauvegardé
                try {
                  const savedOrder = localStorage.getItem('wallets-order');
                  if (savedOrder) {
                    const orderIds = JSON.parse(savedOrder) as number[];
                    // Ajouter le nouveau wallet à la fin de l'ordre sauvegardé
                    const newOrderIds = [...orderIds, newWallet.id];
                    localStorage.setItem('wallets-order', JSON.stringify(newOrderIds));
                  } else {
                    // Créer un nouvel ordre avec le nouveau wallet
                    const newOrderIds = currentWallets.map(w => w.id).concat(newWallet.id);
                    localStorage.setItem('wallets-order', JSON.stringify(newOrderIds));
                  }
                } catch (error) {
                  console.warn('Failed to update wallets order in localStorage:', error);
                }
                
                actions.updateWallets(() => newWallets);
                actions.updateUserWallets(userWallets => [...userWallets, newUserWallet]);
                if (!get().activeWalletId) {
                  actions.setActiveWallet(newWallet.id);
                }
                actions.setLoading(false);
                
                return newWallet;
              }
              
              // Si on a seulement un message de succès, recharger les wallets
              await get().reloadWallets();
              return;
            }
            
            throw new Error("Failed to add wallet");
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to add wallet'));
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
            
            const state = get();
            const newWallets = state.wallets.filter(wallet => wallet.id !== id);
            const newUserWallets = state.userWallets.filter(userWallet => {
              if (userWallet.wallet && typeof userWallet.wallet === 'object' && 'id' in userWallet.wallet) {
                return userWallet.wallet.id !== id;
              }
              return userWallet.walletId !== id;
            });
            
            let newActiveId = state.activeWalletId;
            if (state.activeWalletId === id) {
              newActiveId = newWallets.length > 0 ? newWallets[0].id : null;
            }
            
            // Mettre à jour l'ordre sauvegardé en supprimant le wallet
            try {
              const savedOrder = localStorage.getItem('wallets-order');
              if (savedOrder) {
                const orderIds = JSON.parse(savedOrder) as number[];
                const newOrderIds = orderIds.filter(walletId => walletId !== id);
                localStorage.setItem('wallets-order', JSON.stringify(newOrderIds));
              }
            } catch (error) {
              console.warn('Failed to update wallets order in localStorage:', error);
            }
            
            set({
              wallets: newWallets,
              userWallets: newUserWallets,
              activeWalletId: newActiveId,
              loading: false
            });
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to remove wallet'));
            throw new Error(handleApiError(error, 'Failed to remove wallet'));
          }
        },
        
        setActiveWallet: (id: number) => {
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
          
          set({ wallets: reorderedWallets });
          
          // Sauvegarder l'ordre dans localStorage pour persister les préférences
          try {
            localStorage.setItem('wallets-order', JSON.stringify(newOrder));
          } catch (error) {
            console.warn('Failed to save wallets order to localStorage:', error);
          }
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