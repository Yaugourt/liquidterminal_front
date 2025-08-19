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
import { handleApiError, createOrderManager, validateName } from './utils';
import { 
  InitializeParams, 
  CreateReadListData, 
  UpdateReadListData, 
  AddItemData, 
  UpdateItemData 
} from './types';

interface ReadListsState {
  readLists: ReadList[];
  activeReadListId: number | null;
  activeReadListItems: ReadListItem[];
  loading: boolean;
  error: string | null;
  
  initialize: (params: InitializeParams) => Promise<void>;
  createReadList: (data: CreateReadListData) => Promise<ReadList | void>;
  updateReadList: (id: number, data: UpdateReadListData) => Promise<ReadList | void>;
  deleteReadList: (id: number) => Promise<void>;
  setActiveReadList: (id: number) => void;
  getActiveReadList: () => ReadList | undefined;
  reorderReadLists: (newOrder: number[]) => void;
  refreshReadLists: () => Promise<void>;
  
  // Items management
  loadReadListItems: (listId: number) => Promise<void>;
  
  addItemToReadList: (listId: number, item: AddItemData) => Promise<ReadListItem | void>;
  updateReadListItem: (itemId: number, data: UpdateItemData) => Promise<ReadListItem | void>;
  deleteReadListItem: (itemId: number) => Promise<void>;
  toggleReadStatus: (itemId: number, isRead: boolean) => Promise<void>;
}






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
      const orderManager = createOrderManager<ReadList>('readlists', (list) => list.id);
      
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
            
            const readLists = response?.data || [];
            
            if (!Array.isArray(readLists)) {
              actions.updateReadLists(() => []);
              actions.setActiveList(null);
              actions.updateActiveItems(() => []);
              actions.setLoading(false);
              return;
            }
            
            const orderedReadLists = orderManager.restoreOrder(readLists);
            const currentActiveId = get().activeReadListId;
            const hasValidActiveReadList = orderedReadLists.some(r => r.id === currentActiveId);
            const newActiveId = hasValidActiveReadList ? currentActiveId : (orderedReadLists.length > 0 ? orderedReadLists[0].id : null);
            
            actions.updateReadLists(() => orderedReadLists);
            actions.setActiveList(newActiveId);
            actions.updateActiveItems(() => []);
            actions.setLoading(false);
            
            if (newActiveId) {
              get().loadReadListItems(newActiveId).catch(() => {});
            }
          } catch (err) {
            actions.setError(handleApiError(err, 'Failed to initialize read lists'));
          }
        },
        
        createReadList: async (data: CreateReadListData): Promise<ReadList | void> => {
          try {
            actions.setLoading(true);
            validateName(data.name, { fieldName: 'Read list name' });
            
            const response = await apiCreateReadList(data);
            
            if (response) {
              actions.updateReadLists(lists => [...lists, response]);
              actions.setLoading(false);
              
              if (!get().activeReadListId) {
                actions.setActiveList(response.id);
              }
              return response;
            }
            
            throw new Error("Failed to create read list");
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to create read list'));
          }
        },
        
        updateReadList: async (id: number, data: UpdateReadListData): Promise<ReadList | void> => {
          try {
            actions.setLoading(true);
            if (data.name) validateName(data.name, { fieldName: 'Read list name' });
            
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
            
            actions.updateReadLists(() => newReadLists);
            actions.setActiveList(newActiveId);
            if (state.activeReadListId === id) {
              actions.updateActiveItems(() => []);
            }
            actions.setLoading(false);
          } catch (error) {
            const errorMessage = handleApiError(error, 'Failed to delete read list');
            actions.setError(errorMessage);
            throw new Error(errorMessage);
          }
        },
        
        setActiveReadList: (id: number) => {
          if (!id || isNaN(id)) return;
          
          const readList = get().readLists.find(r => r.id === id);
          if (readList) {
            actions.setActiveList(id);
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
              actions.updateActiveItems(() => []);
              actions.setLoading(false);
              return;
            }
            
            actions.setLoading(true);
            
            const response = await getReadListItems(listId);
            const itemsArray = response?.data || [];
            
            actions.updateActiveItems(() => itemsArray);
            actions.setLoading(false);
            
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to load read list items'));
            actions.updateActiveItems(() => []);
          }
        },
        
        addItemToReadList: async (listId: number, item: AddItemData): Promise<ReadListItem | void> => {
          try {
            actions.setLoading(true);
            
            const response = await addItemToReadList(listId, item);
            
            if (response) {
              actions.setLoading(false);
              
              const currentActiveId = get().activeReadListId;
              
              get().refreshReadLists().catch(() => {});
              if (currentActiveId === listId) {
                await get().loadReadListItems(listId);
              }
              
              return response;
            }
            
            throw new Error("Failed to add item to read list");
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to add item to read list'));
          }
        },
        
        updateReadListItem: async (itemId: number, data: UpdateItemData): Promise<ReadListItem | void> => {
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
            
            await apiDeleteReadListItem(itemId);
            actions.updateActiveItems(items => items.filter(item => item.id !== itemId));
            actions.setLoading(false);
            
            get().refreshReadLists().catch(() => {});
            
          } catch (error) {
            const errorMessage = handleApiError(error, 'Failed to delete read list item');
            actions.setError(errorMessage);
            throw new Error(errorMessage);
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
          
          actions.updateReadLists(() => reorderedLists);
          orderManager.saveOrder(reorderedLists);
        },

        refreshReadLists: async () => {
          try {
            const response = await getMyReadLists();
            const readLists = response?.data || [];
            
            const orderedReadLists = orderManager.restoreOrder(readLists);
            
            actions.updateReadLists(() => orderedReadLists);
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