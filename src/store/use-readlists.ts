import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ReadList, ReadListItem } from "../services/education/readList/types";
import { 
  getMyReadLists, 
  createReadList as apiCreateReadList,
  updateReadList as apiUpdateReadList,
  deleteReadList as apiDeleteReadList,
  getReadListItems,
  addItemToReadList,
  updateReadListItem as apiUpdateReadListItem,
  deleteReadListItem as apiDeleteReadListItem
} from "../services/education/readList/api";
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
  
  // Items management
  loadReadListItems: (listId: number) => Promise<void>;
  addItemToReadList: (listId: number, item: { resourceId: number; notes?: string; order?: number; isRead?: boolean }) => Promise<ReadListItem | void>;
  updateReadListItem: (itemId: number, data: { notes?: string; order?: number; isRead?: boolean }) => Promise<ReadListItem | void>;
  deleteReadListItem: (itemId: number) => Promise<void>;
  toggleReadStatus: (itemId: number, isRead: boolean) => Promise<void>;
}

// Utility functions
const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as any).response;
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

const parseApiResponse = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (response?.readLists && Array.isArray(response.readLists)) return response.readLists;
  return [];
};

// Action creators for better state management
const createActionCreators = (set: any, get: any) => ({
  setLoading: (loading: boolean) => set({ loading, error: loading ? null : get().error }),
  setError: (error: string | null) => set({ error, loading: false }),
  updateReadLists: (updater: (lists: ReadList[]) => ReadList[]) => 
    set((state: any) => ({ readLists: updater(state.readLists) })),
  updateActiveItems: (updater: (items: ReadListItem[]) => ReadListItem[]) => 
    set((state: any) => ({ activeReadListItems: updater(state.activeReadListItems) })),
  setActiveList: (id: number | null) => set({ activeReadListId: id, activeReadListItems: [] })
});

export const useReadLists = create<ReadListsState>()(
  persist(
    (set, get) => {
      const actions = createActionCreators(set, get);
      
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
            const readLists = parseApiResponse(response);
            
            // Ensure we have a valid active read list
            const currentActiveId = get().activeReadListId;
            const hasValidActiveReadList = readLists.some(r => r.id === currentActiveId);
            const newActiveId = hasValidActiveReadList ? currentActiveId : (readLists.length > 0 ? readLists[0].id : null);
            
            set({
              readLists,
              activeReadListId: newActiveId,
              activeReadListItems: [],
              loading: false
            });
            
            // Load items for the new active read list if it exists
            if (newActiveId) {
              get().loadReadListItems(newActiveId);
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
              actions.updateReadLists(lists => [...lists, response]);
              if (!get().activeReadListId) {
                actions.setActiveList(response.id);
              }
              actions.setLoading(false);
              return response;
            }
            
            throw new Error("Failed to create read list");
          } catch (error) {
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
            
            actions.setLoading(true);
            
            const response = await getReadListItems(listId);
            const itemsArray = parseApiResponse(response);
            
            set({
              activeReadListItems: itemsArray,
              loading: false
            });
          } catch (error) {
            actions.setError(handleApiError(error, 'Failed to load read list items'));
            set({ activeReadListItems: [] });
          }
        },
        
        addItemToReadList: async (listId: number, item): Promise<ReadListItem | void> => {
          try {
            actions.setLoading(true);
            
            const response = await addItemToReadList(listId, item);
            
            if (response) {
              actions.updateActiveItems(items => [...items, response]);
              actions.setLoading(false);
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
            
            await apiDeleteReadListItem(itemId);
            
            actions.updateActiveItems(items => items.filter(item => item.id !== itemId));
            actions.setLoading(false);
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