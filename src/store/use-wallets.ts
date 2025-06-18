import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Wallet, UserWallet, WalletsState } from "../services/wallets/types";
import { addWallet, getWalletsByUser, removeWalletFromUser } from "../services/wallets/api";
import { AuthService } from "../services/auth/service";

interface InitializeParams {
  privyUserId: string;
  username: string;
  privyToken: string;
}

export const useWallets = create<WalletsState>()(
  persist(
    (set, get) => ({
      wallets: [],
      userWallets: [],
      activeWalletId: null,
      loading: false,
      error: null,
      
      initialize: async ({ privyUserId, username, privyToken }: InitializeParams): Promise<void> => {
        try {
          set({ loading: true, error: null });
          console.log("Initializing wallets for user:", privyUserId);
          
          // Ensure user is initialized in our DB first
          const authService = AuthService.getInstance();
          const isInitialized = await authService.ensureUserInitialized(privyUserId, username, privyToken);
          if (!isInitialized) {
            throw new Error("Failed to initialize user in database");
          }
          
          const response = await getWalletsByUser(String(privyUserId));
          console.log("API response:", response);
          
          if (!response.data || !Array.isArray(response.data)) {
            throw new Error("Invalid response format from server");
          }
          
          const userWallets = response.data;
          console.log("User wallets from API:", userWallets);
          
          const wallets = userWallets
            .map((uw: UserWallet) => {
              console.log("Processing user wallet:", uw);
              console.log("Wallet object:", uw.wallet);
              console.log("Basic info:", {
                id: uw.id,
                walletId: uw.walletId,
                name: uw.name,
                address: uw.address
              });
              
              // Si nous avons un objet wallet complet
              if (uw.wallet && typeof uw.wallet === 'object') {
                console.log("Found complete wallet object:", uw.wallet);
                return {
                  id: uw.wallet.id,
                  address: uw.wallet.address || uw.address || '',
                  name: uw.wallet.name || uw.name || `Wallet ${uw.id}`,
                  addedAt: uw.wallet.addedAt || uw.addedAt || new Date()
                };
              }
              
              // Si nous n'avons que les informations de base
              console.log("Using basic wallet info");
              return {
                id: uw.walletId,
                address: uw.address || '',
                name: uw.name || `Wallet ${uw.id}`,
                addedAt: uw.addedAt || new Date()
              };
            })
            .filter((wallet): wallet is Wallet => {
              const isValid = wallet !== undefined && 
                typeof wallet.id === 'number' &&
                typeof wallet.name === 'string';
              
              if (!isValid) {
                console.warn("Filtered out invalid wallet:", wallet);
              }
              
              return isValid;
            });
          
          console.log("Processed wallets:", wallets);
          
          // Ensure we have a valid active wallet
          const currentActiveId = get().activeWalletId;
          const hasValidActiveWallet = wallets.some(w => w.id === currentActiveId);
          
          set({
            wallets,
            userWallets: response.data,
            activeWalletId: hasValidActiveWallet ? currentActiveId : (wallets.length > 0 ? wallets[0].id : null),
            loading: false
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize wallets';
          set({ error: errorMessage, loading: false });
          console.error('Error initializing wallets:', err);
        }
      },
      
      addWallet: async (address: string, name?: string, privyUserId?: string | number): Promise<Wallet | void> => {
        try {
          set({ loading: true, error: null });
          
          if (!address || !privyUserId) {
            throw new Error("Address and user ID are required");
          }
          
          const normalizedAddress = address.toLowerCase().trim();
          if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
            throw new Error("Invalid wallet address format");
          }
          
          if (name && name.length > 255) {
            throw new Error("Wallet name is too long");
          }
          
          const walletName = name || `Wallet ${get().wallets.length + 1}`;
          const response = await addWallet(normalizedAddress, walletName, String(privyUserId));
          
          if (response.wallet && response.userWallet) {
            const newWallet = {
              ...response.wallet,
              name: response.wallet.name || walletName
            };
            const newUserWallet = response.userWallet;
            
            set(state => ({
              wallets: [...state.wallets, newWallet],
              userWallets: [...state.userWallets, newUserWallet],
              activeWalletId: state.activeWalletId || newWallet.id,
              loading: false
            }));
            
            return newWallet;
          }
          
          throw new Error("Failed to add wallet");
        } catch (error: any) {
          let errorMessage = 'Failed to add wallet';
          
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (error.response) {
            switch (error.response.status) {
              case 409:
                errorMessage = 'This wallet already exists in your account';
                break;
              case 400:
                errorMessage = 'Invalid wallet address or name';
                break;
            }
          }
          
          set({ error: errorMessage, loading: false });
          console.error('Error adding wallet:', error);
        }
      },
      
      removeWallet: async (id: number): Promise<void> => {
        try {
          set({ loading: true, error: null });
          
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
          
          await removeWalletFromUser(userWallet.userId, id);
          
          set(state => {
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
            
            return {
              wallets: newWallets,
              userWallets: newUserWallets,
              activeWalletId: newActiveId,
              loading: false
            };
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to remove wallet';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },
      
      setActiveWallet: (id: number) => {
        const wallet = get().wallets.find(w => w.id === id);
        if (wallet) {
          set({ activeWalletId: id });
        }
      },
      
      getActiveWallet: () => {
        const { wallets, activeWalletId } = get();
        return wallets.find(wallet => wallet.id === activeWalletId);
      }
    }),
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