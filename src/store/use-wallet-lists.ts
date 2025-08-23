import { create } from "zustand";
import { 
  WalletList, 
  WalletListsState, 
  CreateWalletListInput, 
  UpdateWalletListInput,
  CreateWalletListItemInput,
  WalletListItem
} from "../services/market/tracker/types";
import {
  getUserWalletLists,
  getPublicWalletLists,
  createWalletList,
  updateWalletList,
  deleteWalletList,
  copyWalletList,
  addWalletToList,
  getWalletListItems,
  removeWalletFromList
} from "../services/market/tracker/walletlist.service";
import { handleApiError } from './utils';

// Action creators for better state management
const createActionCreators = (set: (fn: (state: WalletListsState) => Partial<WalletListsState>) => void) => ({
  setLoading: (loading: boolean) => set((state) => ({ loading, error: loading ? null : state.error })),
  setError: (error: string | null) => set(() => ({ error, loading: false })),
  setUserLists: (lists: WalletList[]) => set(() => ({ userLists: lists })),
  setPublicLists: (lists: WalletList[]) => set(() => ({ publicLists: lists })),
  setActiveList: (id: number | null) => set(() => ({ activeListId: id, activeListItems: [] })),
  updateActiveItems: (updater: (items: WalletListItem[]) => WalletListItem[]) => 
    set((state: WalletListsState) => ({ activeListItems: updater(state.activeListItems) })),
});

export const useWalletLists = create<WalletListsState>()(
  (set, get) => {
      const actions = createActionCreators(set);
      
      return {
        userLists: [],
        publicLists: [],
        activeListId: null,
        activeListItems: [],
        loading: false,
        error: null,
        
        initialize: async (): Promise<void> => {
          // Pour l'instant, on ne charge rien automatiquement
          // Les données seront chargées à la demande
        },
        
        loadUserLists: async (params?: { search?: string; limit?: number }): Promise<void> => {
          try {
            actions.setLoading(true);
            
            // VIDER complètement les listes avant de charger
            actions.setUserLists([]);
            
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
            // Optionnel: définir activeListId si aucune sélection encore
            if (!get().activeListId) {
              actions.setActiveList(newList.id);
            }
            
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
            
            // Si on supprime la liste active, réinitialiser activeListId
            if (get().activeListId === id) {
              actions.setActiveList(filteredUserLists[0]?.id ?? null);
            }
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
        },
        
        refreshUserLists: async (): Promise<void> => {
          try {
            actions.setLoading(true);
            const response = await getUserWalletLists();
            actions.setUserLists(response.data);
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to refresh user wallet lists'));
            throw err;
          } finally {
            actions.setLoading(false);
          }
        },

        // Recharger les items d'une liste spécifique (pour quand un wallet est supprimé)
        refreshListItems: async (listId: number): Promise<void> => {
          try {
            // Recharger les listes et les items de la liste ciblée
            await get().refreshUserLists();
            await get().loadListItems(listId);
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to refresh list items'));
            throw err;
          }
        },

        // Ajouter un wallet à une liste (comme les readlists)
        addWalletToList: async (listId: number, data: CreateWalletListItemInput): Promise<WalletListItem | void> => {
          try {
            actions.setLoading(true);
            
            const response = await addWalletToList(listId, data);
            
            if (response) {
              actions.setLoading(false);
              
              const currentActiveId = get().activeListId;
              
              // Optimistic UI: mettre à jour immédiatement les items de la liste active
              if (currentActiveId === listId) {
                actions.updateActiveItems(items => [response, ...items]);
              }
              // Mettre à jour le compteur d'items de la liste côté userLists
              const currentUserLists = get().userLists;
              const bumpedLists = currentUserLists.map(list => 
                list.id === listId ? { ...list, itemsCount: (list.itemsCount || 0) + 1 } : list
              );
              actions.setUserLists(bumpedLists);
              
              // Puis rafraîchir en arrière-plan pour se resynchroniser
              get().refreshUserLists().catch(() => {});
              if (currentActiveId === listId) {
                await get().loadListItems(listId);
              }
              
              return response;
            }
            
            throw new Error("Failed to add wallet to list");
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to add wallet to list'));
          }
        },

        // Charger les items d'une liste dans le store (comme les readlists)
        loadListItems: async (listId: number): Promise<void> => {
          try {
            if (!listId || isNaN(listId)) {
              actions.updateActiveItems(() => []);
              actions.setLoading(false);
              return;
            }
            
            actions.setLoading(true);
            
            const response = await getWalletListItems(listId);
            const itemsArray = response?.data || [];
            
            // Filtrer les items qui ont un userWallet valide (au cas où un wallet a été supprimé)
            const validItems = itemsArray.filter(item => item.userWallet && item.userWallet.Wallet);
            
// Logs supprimés
            
            actions.updateActiveItems(() => validItems);
            actions.setLoading(false);
            
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to load wallet list items'));
            actions.updateActiveItems(() => []);
          }
        },

        // Récupérer les items d'une liste (fonction utilitaire)
        getListItems: async (listId: number): Promise<WalletListItem[]> => {
          try {
            const response = await getWalletListItems(listId);
            return response.data || [];
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to get list items'));
            throw err;
          }
        },

        // Supprimer un wallet d'une liste (comme les readlists)
        removeWalletFromList: async (itemId: number): Promise<void> => {
          try {
            actions.setLoading(true);
            
            await removeWalletFromList(itemId);
            // Optimistic UI: retirer immédiatement l'item
            const prevItems = get().activeListItems;
            const removedItem = prevItems.find(i => i.id === itemId) || null;
            actions.updateActiveItems(items => items.filter(item => item.id !== itemId));
            actions.setLoading(false);
            
            // Mettre à jour le compteur d'items si on connaît la liste
            if (removedItem) {
              const listId = removedItem.walletListId;
              const currentUserLists = get().userLists;
              const decreasedLists = currentUserLists.map(list => 
                list.id === listId ? { ...list, itemsCount: Math.max((list.itemsCount || 1) - 1, 0) } : list
              );
              actions.setUserLists(decreasedLists);
            }
            
            // Puis rafraîchir en arrière-plan pour se resynchroniser
            get().refreshUserLists().catch(() => {});
            
          } catch (error) {
            const errorMessage = handleApiError(error, 'Failed to remove wallet from list');
            actions.setError(errorMessage);
            throw new Error(errorMessage);
          }
        },

        // Définir la liste active
        setActiveList: (id: number) => {
          const list = get().userLists.find(l => l.id === id);
          if (list) {
            // Vider d'abord les items pour éviter les données cached
            actions.updateActiveItems(() => []);
            actions.setActiveList(id);
            get().loadListItems(id);
          }
        }
      };
    }
  );
