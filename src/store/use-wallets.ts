import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Wallet } from "@/services/wallets/types";
import { getWalletInfo, clearCache } from "@/services/wallets/api";

interface WalletsState {
  wallets: Wallet[];
  activeWalletId: string | null;
  isUpdating: Record<string, boolean>;
  lastUpdated: Record<string, number>;
  errors: Record<string, string | null>;
  addWallet: (address: string, name?: string) => Promise<void>;
  removeWallet: (id: string) => void;
  setActiveWallet: (id: string) => void;
  getActiveWallet: () => Wallet | undefined;
  updateWalletInfo: (id: string, forceRefresh?: boolean) => Promise<void>;
  clearErrors: (id?: string) => void;
  renameWallet: (id: string, newName: string) => void;
  refreshAllWallets: () => Promise<void>;
}

export const useWallets = create<WalletsState>()(
  persist(
    (set, get) => ({
      wallets: [],
      activeWalletId: null,
      isUpdating: {},
      lastUpdated: {},
      errors: {},
      
      addWallet: async (address: string, name?: string) => {
        const normalizedAddress = address.toLowerCase().trim();
        const existingWallet = get().wallets.find(w => 
          w.address.toLowerCase().trim() === normalizedAddress
        );
        
        if (existingWallet) {
          throw new Error(`Wallet with address ${address} already exists`);
        }
        
        try {
          const walletInfo = await getWalletInfo(normalizedAddress);
          const newWallet: Wallet = {
            id: uuidv4(),
            address: normalizedAddress,
            name: name || `Wallet ${get().wallets.length + 1}`,
            info: walletInfo
          };
          
          set(state => ({
            wallets: [...state.wallets, newWallet],
            activeWalletId: state.activeWalletId || newWallet.id,
            lastUpdated: { ...state.lastUpdated, [newWallet.id]: Date.now() },
            errors: { ...state.errors, [newWallet.id]: null }
          }));
        } catch (error) {
          console.error("Failed to add wallet:", error);
          throw error;
        }
      },
      
      removeWallet: (id: string) => {
        set(state => {
          const newWallets = state.wallets.filter(wallet => wallet.id !== id);
          let newActiveId = state.activeWalletId;
          
          if (state.activeWalletId === id) {
            newActiveId = newWallets.length > 0 ? newWallets[0].id : null;
          }
          
          const newIsUpdating = { ...state.isUpdating };
          delete newIsUpdating[id];
          
          const newLastUpdated = { ...state.lastUpdated };
          delete newLastUpdated[id];
          
          const newErrors = { ...state.errors };
          delete newErrors[id];
          
          const walletToRemove = state.wallets.find(w => w.id === id);
          if (walletToRemove) {
            clearCache(walletToRemove.address);
          }
          
          return {
            wallets: newWallets,
            activeWalletId: newActiveId,
            isUpdating: newIsUpdating,
            lastUpdated: newLastUpdated,
            errors: newErrors
          };
        });
      },
      
      setActiveWallet: (id: string) => {
        const { wallets, lastUpdated } = get();
        const wallet = wallets.find(w => w.id === id);
        
        if (!wallet) {
          console.warn(`Wallet with id ${id} not found`);
          return;
        }
        
        const now = Date.now();
        const lastUpdate = lastUpdated[id] || 0;
        const isStale = now - lastUpdate > 5 * 60 * 1000;
        
        set({ activeWalletId: id });
        
        if (isStale) {
          get().updateWalletInfo(id);
        }
      },
      
      getActiveWallet: () => {
        const { wallets, activeWalletId } = get();
        return wallets.find(wallet => wallet.id === activeWalletId);
      },
      
      updateWalletInfo: async (id: string, forceRefresh = false) => {
        const { wallets, isUpdating } = get();
        const wallet = wallets.find(w => w.id === id);
        
        if (!wallet || isUpdating[id]) {
          console.warn(`Wallet with id ${id} not found or update already in progress`);
          return Promise.resolve();
        }
        
        set(state => ({
          isUpdating: { ...state.isUpdating, [id]: true },
          errors: { ...state.errors, [id]: null }
        }));
        
        try {
          const walletInfo = await getWalletInfo(wallet.address, forceRefresh);
          
          set(state => ({
            wallets: state.wallets.map(w => 
              w.id === id ? { ...w, info: walletInfo } : w
            ),
            isUpdating: { ...state.isUpdating, [id]: false },
            lastUpdated: { ...state.lastUpdated, [id]: Date.now() }
          }));
          
          return Promise.resolve();
        } catch (error) {
          console.error("Failed to update wallet info:", error);
          
          set(state => ({
            isUpdating: { ...state.isUpdating, [id]: false },
            errors: { ...state.errors, [id]: error instanceof Error ? error.message : "Unknown error" }
          }));
          
          return Promise.reject(error);
        }
      },
      
      clearErrors: (id?: string) => {
        if (id) {
          set(state => ({
            errors: { ...state.errors, [id]: null }
          }));
        } else {
          set({ errors: {} });
        }
      },
      
      renameWallet: (id: string, newName: string) => {
        set(state => ({
          wallets: state.wallets.map(w => 
            w.id === id ? { ...w, name: newName } : w
          )
        }));
      },
      
      refreshAllWallets: async () => {
        const { wallets } = get();
        
        const updatePromises = wallets.map(wallet => 
          get().updateWalletInfo(wallet.id, true)
            .catch(error => console.error(`Failed to update wallet ${wallet.id}:`, error))
        );
        
        await Promise.all(updatePromises);
      }
    }),
    {
      name: "wallets-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wallets: state.wallets,
        activeWalletId: state.activeWalletId
      })
    }
  )
); 