import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  WalletList, 
  WalletListsState, 
  CreateWalletListInput, 
  UpdateWalletListInput 
} from "../services/market/tracker/types";
import {
  getUserWalletLists,
  getPublicWalletLists,
  createWalletList,
  updateWalletList,
  deleteWalletList,
  copyWalletList
} from "../services/market/tracker/walletlist.service";
import { handleApiError } from './utils';

// Action creators for better state management
const createActionCreators = (set: (fn: (state: WalletListsState) => Partial<WalletListsState>) => void) => ({
  setLoading: (loading: boolean) => set((state) => ({ loading, error: loading ? null : state.error })),
  setError: (error: string | null) => set(() => ({ error, loading: false })),
  setUserLists: (lists: WalletList[]) => set(() => ({ userLists: lists })),
  setPublicLists: (lists: WalletList[]) => set(() => ({ publicLists: lists })),
});

export const useWalletLists = create<WalletListsState>()(
  persist(
    (set, get) => {
      const actions = createActionCreators(set);
      
      return {
        userLists: [],
        publicLists: [],
        loading: false,
        error: null,
        
        initialize: async (): Promise<void> => {
          // Pour l'instant, on ne charge rien automatiquement
          // Les données seront chargées à la demande
        },
        
        loadUserLists: async (params?: { search?: string; limit?: number }): Promise<void> => {
          try {
            actions.setLoading(true);
            const response = await getUserWalletLists(params);
            actions.setUserLists(response.data);
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to load user wallet lists'));
            throw err;
          } finally {
            actions.setLoading(false);
          }
        },
        
        loadPublicLists: async (params?: { search?: string; limit?: number }): Promise<void> => {
          try {
            actions.setLoading(true);
            const response = await getPublicWalletLists(params);
            actions.setPublicLists(response.data);
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to load public wallet lists'));
            throw err;
          } finally {
            actions.setLoading(false);
          }
        },
        
        createList: async (data: CreateWalletListInput): Promise<WalletList> => {
          try {
            actions.setLoading(true);
            const newList = await createWalletList(data);
            
            // Ajouter à la liste des user lists
            const currentUserLists = get().userLists;
            actions.setUserLists([newList, ...currentUserLists]);
            
            return newList;
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to create wallet list'));
            throw err;
          } finally {
            actions.setLoading(false);
          }
        },
        
        updateList: async (id: number, data: UpdateWalletListInput): Promise<WalletList> => {
          try {
            actions.setLoading(true);
            const updatedList = await updateWalletList(id, data);
            
            // Mettre à jour dans les listes
            const currentUserLists = get().userLists;
            const updatedUserLists = currentUserLists.map(list => 
              list.id === id ? updatedList : list
            );
            actions.setUserLists(updatedUserLists);
            
            return updatedList;
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to update wallet list'));
            throw err;
          } finally {
            actions.setLoading(false);
          }
        },
        
        deleteList: async (id: number): Promise<void> => {
          try {
            actions.setLoading(true);
            await deleteWalletList(id);
            
            // Supprimer de la liste des user lists
            const currentUserLists = get().userLists;
            const filteredUserLists = currentUserLists.filter(list => list.id !== id);
            actions.setUserLists(filteredUserLists);
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to delete wallet list'));
            throw err;
          } finally {
            actions.setLoading(false);
          }
        },
        
        copyList: async (id: number): Promise<WalletList> => {
          try {
            actions.setLoading(true);
            const copiedList = await copyWalletList(id);
            
            // Ajouter à la liste des user lists
            const currentUserLists = get().userLists;
            actions.setUserLists([copiedList, ...currentUserLists]);
            
            return copiedList;
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to copy wallet list'));
            throw err;
          } finally {
            actions.setLoading(false);
          }
        },
        
        clearError: () => {
          actions.setError(null);
        }
      };
    },
    {
      name: "wallet-lists-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userLists: state.userLists,
        publicLists: state.publicLists
      })
    }
  )
);
