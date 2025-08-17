import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ReadList, ReadListItem } from "../services/wiki/readList/types";
import { 
  getMyReadLists, 
  createReadList as apiCreateReadList,
  updateReadList as apiUpdateReadList,
  deleteReadList as apiDeleteReadList,
  getReadListItems,
  addItemToReadList,
  updateReadListItem as apiUpdateReadListItem,
  deleteReadListItem as apiDeleteReadListItem
} from "../services/wiki/readList/api";
import { AuthService } from "../services/auth";

interface InitializeParams {
  privyUserId: string;
  username: string;
  privyToken: string;
}

interface ReadListsState {
  readLists: ReadList[];
  activeReadListId: number | null;
  activeReadListItems: ReadListItem[];
  loading: boolean;
  error: string | null;
  
  initialize: (params: InitializeParams) => Promise<void>;
  createReadList: (data: { name: string; description?: string; isPublic?: boolean }) => Promise<ReadList | void>;
  updateReadList: (id: number, data: { name?: string; description?: string; isPublic?: boolean }) => Promise<ReadList | void>;
  deleteReadList: (id: number) => Promise<void>;
  setActiveReadList: (id: number) => void;
  getActiveReadList: () => ReadList | undefined;
  reorderReadLists: (newOrder: number[]) => void;
  refreshReadLists: () => Promise<void>;
  
  // Items management
  loadReadListItems: (listId: number) => Promise<void>;
  refreshReadListItems: (listId: number) => Promise<void>;
  addItemToReadList: (listId: number, item: { resourceId: number; notes?: string; order?: number; isRead?: boolean }) => Promise<ReadListItem | void>;
  updateReadListItem: (itemId: number, data: { notes?: string; order?: number; isRead?: boolean }) => Promise<ReadListItem | void>;
  deleteReadListItem: (itemId: number) => Promise<void>;
  toggleReadStatus: (itemId: number, isRead: boolean) => Promise<void>;
}

// Utility functions
const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    switch (response?.status) {
      case 409: return 'A read list with this name already exists';
      case 400: return 'Invalid data provided';
      case 404: return 'Resource not found';
      case 403: return 'Access denied';
      default: return defaultMessage;
    }
  }
  return defaultMessage;
};

const validateReadListName = (name: string): void => {
  if (!name?.trim() || name.trim().length < 2) {
    throw new Error("Read list name must be at least 2 characters");
  }
  if (name.length > 255) {
    throw new Error("Read list name is too long");
  }
};



// Action creators for better state management
const createActionCreators = (set: (fn: (state: ReadListsState) => Partial<ReadListsState>) => void) => ({
  setLoading: (loading: boolean) => set((state) => ({ loading, error: loading ? null : state.error })),
  setError: (error: string | null) => set(() => ({ error, loading: false })),
  updateReadLists: (updater: (lists: ReadList[]) => ReadList[]) => 
    set((state: ReadListsState) => ({ readLists: updater(state.readLists) })),
  updateActiveItems: (updater: (items: ReadListItem[]) => ReadListItem[]) => 
    set((state: ReadListsState) => ({ activeReadListItems: updater(state.activeReadListItems) })),
  setActiveList: (id: number | null) => 
    set(() => ({ activeReadListId: id, activeReadListItems: [] }))
});

export const useReadLists = create<ReadListsState>()(
  persist(
    (set, get) => {
      const actions = createActionCreators(set);
      
      return {
        readLists: [],
        activeReadListId: null,
        activeReadListItems: [],
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
            
            const response = await getMyReadLists();
            
            // Extract data from response object
            const readLists = response?.data || [];
            
            // Ensure readLists is an array
            if (!Array.isArray(readLists)) {
              // Warning: getMyReadLists returned non-array
              set({
                readLists: [],
                activeReadListId: null,
                activeReadListItems: [],
                loading: false
              });
              return;
            }
            
            // Restaurer l'ordre sauvegardé si disponible
            let orderedReadLists = readLists;
            try {
              const savedOrder = localStorage.getItem('readlists-order');
              if (savedOrder) {
                const orderIds = JSON.parse(savedOrder) as number[];
                const savedLists = orderIds
                  .map(id => readLists.find(list => list.id === id))
                  .filter((list): list is ReadList => list !== undefined);
                
                // Ajouter les nouvelles listes qui ne sont pas dans l'ordre sauvegardé
                const newLists = readLists.filter(list => !orderIds.includes(list.id));
                orderedReadLists = [...savedLists, ...newLists];
              }
            } catch {
              // Warning: Failed to restore read lists order from localStorage
            }
            
            // Ensure we have a valid active read list
            const currentActiveId = get().activeReadListId;
            const hasValidActiveReadList = orderedReadLists.some(r => r.id === currentActiveId);
            const newActiveId = hasValidActiveReadList ? currentActiveId : (orderedReadLists.length > 0 ? orderedReadLists[0].id : null);
            
            set({
              readLists: orderedReadLists,
              activeReadListId: newActiveId,
              activeReadListItems: [],
              loading: false
            });
            
            // Load items for the new active read list if it exists (non-blocking)
            if (newActiveId) {
              // Don't await - let it load in background
              get().loadReadListItems(newActiveId).catch(() => {});
            }
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to initialize read lists'));
          }
        },
        
        createReadList: async (data): Promise<ReadList | void> => {
          try {
            actions.setLoading(true);
            validateReadListName(data.name);
            
            const response = await apiCreateReadList(data);
            
            if (response) {
              const currentState = get();
              
              // Mise à jour directe du state
              set({
                readLists: [...currentState.readLists, response],
                loading: false
              });
              
              if (!get().activeReadListId) {
                actions.setActiveList(response.id);
              }
              return response;
            }
            
            throw new Error("Failed to create read list");
          } catch (error) {
            // Silent error handling
            actions.setError(handleApiError(error, 'Failed to create read list'));
          }
        },
        
        updateReadList: async (id: number, data): Promise<ReadList | void> => {
          try {
            actions.setLoading(true);
            if (data.name) validateReadListName(data.name);
            
            const response = await apiUpdateReadList(id, data);
            
            if (response) {
              actions.updateReadLists(lists => 
                lists.map(list => list.id === id ? { ...list, ...response } : list)
              );
              actions.setLoading(false);
              return response;
            }
            
            throw new Error("Failed to update read list");
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to update read list'));
          }
        },
        
        deleteReadList: async (id: number): Promise<void> => {
          try {
            actions.setLoading(true);
            
            await apiDeleteReadList(id);
            
            const state = get();
            const newReadLists = state.readLists.filter(list => list.id !== id);
            let newActiveId = state.activeReadListId;
            
            if (state.activeReadListId === id) {
              newActiveId = newReadLists.length > 0 ? newReadLists[0].id : null;
            }
            
            set({
              readLists: newReadLists,
              activeReadListId: newActiveId,
              activeReadListItems: state.activeReadListId === id ? [] : state.activeReadListItems,
              loading: false
            });
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to delete read list'));
            throw new Error(handleApiError(error, 'Failed to delete read list'));
          }
        },
        
        setActiveReadList: (id: number) => {
          if (!id || isNaN(id)) return;
          
          const readList = get().readLists.find(r => r.id === id);
          if (readList) {
            actions.setActiveList(id);
            // Toujours recharger les items pour avoir les données fraîches
            get().loadReadListItems(id);
          }
        },
        
        getActiveReadList: () => {
          const { readLists, activeReadListId } = get();
          return readLists.find(readList => readList.id === activeReadListId);
        },
        
        loadReadListItems: async (listId: number): Promise<void> => {
          try {
            if (!listId || isNaN(listId)) {
              set({ activeReadListItems: [], loading: false });
              return;
            }
            
            // Toujours recharger depuis l'API pour avoir les données fraîches
            actions.setLoading(true);
            
            const response = await getReadListItems(listId);
            const itemsArray = response?.data || [];
            
            set({
              activeReadListItems: itemsArray,
              loading: false
            });
            
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to load read list items'));
            set({ activeReadListItems: [] });
          }
        },
        
        refreshReadListItems: async (listId: number): Promise<void> => {
          try {
            if (!listId || isNaN(listId)) {
              return;
            }
            
            actions.setLoading(true);
            
            const response = await getReadListItems(listId);
            const itemsArray = response?.data || [];
            
            set({
              activeReadListItems: itemsArray,
              loading: false
            });
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to refresh read list items'));
          }
        },
        
        addItemToReadList: async (listId: number, item): Promise<ReadListItem | void> => {
          try {
            actions.setLoading(true);
            
            const response = await addItemToReadList(listId, item);
            
            if (response) {
              actions.setLoading(false);
              
              // Recharger la liste des readlists pour mettre à jour le itemsCount
              await get().refreshReadLists();
              
              // Si c'est la readlist active, recharger les items
              if (get().activeReadListId === listId) {
                await get().loadReadListItems(listId);
              }
              
              return response;
            }
            
            throw new Error("Failed to add item to read list");
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to add item to read list'));
          }
        },
        
        updateReadListItem: async (itemId: number, data): Promise<ReadListItem | void> => {
          try {
            actions.setLoading(true);
            
            const response = await apiUpdateReadListItem(itemId, data);
            
            if (response) {
              actions.updateActiveItems(items => 
                items.map(item => item.id === itemId ? { ...item, ...response } : item)
              );
              actions.setLoading(false);
              return response;
            }
            
            throw new Error("Failed to update read list item");
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to update read list item'));
          }
        },
        
        deleteReadListItem: async (itemId: number): Promise<void> => {
          try {
            actions.setLoading(true);
            
            // Appel API d'abord
            await apiDeleteReadListItem(itemId);
            
            // Si l'API réussit, mettre à jour l'état local
            const updatedItems = get().activeReadListItems.filter(item => item.id !== itemId);
            
            set({ 
              activeReadListItems: updatedItems,
              loading: false 
            });
            
            // Recharger la liste des readlists pour mettre à jour le itemsCount
            await get().refreshReadLists();
            
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to delete read list item'));
            throw new Error(handleApiError(error, 'Failed to delete read list item'));
          }
        },
        
        toggleReadStatus: async (itemId: number, isRead: boolean): Promise<void> => {
          try {
            actions.setLoading(true);
            
            const response = await apiUpdateReadListItem(itemId, { isRead });
            
            if (response) {
              actions.updateActiveItems(items => 
                items.map(item => item.id === itemId ? { ...item, isRead } : item)
              );
              actions.setLoading(false);
            }
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to toggle read status'));
          }
        },
        
        reorderReadLists: (newOrder: number[]) => {
          const currentLists = get().readLists;
          const reorderedLists = newOrder
            .map(id => currentLists.find(list => list.id === id))
            .filter((list): list is ReadList => list !== undefined);
          
          set({ readLists: reorderedLists });
          
          // Sauvegarder l'ordre dans localStorage pour persister les préférences
          try {
            localStorage.setItem('readlists-order', JSON.stringify(newOrder));
                      } catch {
              // Warning: Failed to save read lists order to localStorage
            }
        },

        refreshReadLists: async () => {
          try {
            const response = await getMyReadLists();
            const readLists = response?.data || [];
            
            // Préserver l'ordre sauvegardé
            let orderedReadLists = readLists;
            try {
              const savedOrder = localStorage.getItem('readlists-order');
              if (savedOrder) {
                const orderIds = JSON.parse(savedOrder) as number[];
                const savedLists = orderIds
                  .map(id => readLists.find(list => list.id === id))
                  .filter((list): list is ReadList => list !== undefined);
                
                // Ajouter les nouvelles listes qui ne sont pas dans l'ordre sauvegardé
                const newLists = readLists.filter(list => !orderIds.includes(list.id));
                orderedReadLists = [...savedLists, ...newLists];
              }
                          } catch {
                // Warning: Failed to restore read lists order from localStorage
              }
            
            set({ readLists: orderedReadLists });
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to refresh read lists'));
          }
        }
      };
    },
    {
      name: "readlists-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        readLists: state.readLists,
        activeReadListId: state.activeReadListId
      })
    }
  )
); 