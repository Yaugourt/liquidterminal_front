import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReadList, ReadListItem, CreateReadListRequest } from '@/types/read-list.types';

interface ReadListStore {
  readLists: ReadList[];
  activeReadListId: string | null;
  
  // Actions
  createReadList: (data: CreateReadListRequest) => ReadList;
  deleteReadList: (id: string) => void;
  updateReadList: (id: string, updates: Partial<ReadList>) => void;
  setActiveReadList: (id: string | null) => void;
  
  // Items management
  addItemToReadList: (readListId: string, item: Omit<ReadListItem, 'id' | 'addedAt' | 'isRead'>) => void;
  removeItemFromReadList: (readListId: string, itemId: string) => void;
  markItemAsRead: (readListId: string, itemId: string, isRead: boolean) => void;
  
  // Utils
  getReadListById: (id: string) => ReadList | undefined;
  getActiveReadList: () => ReadList | undefined;
  isItemInAnyReadList: (url: string) => boolean;
}

export const useReadListStore = create<ReadListStore>()(
  persist(
    (set, get) => ({
      readLists: [],
      activeReadListId: null,
      
      createReadList: (data: CreateReadListRequest) => {
        const newReadList: ReadList = {
          id: crypto.randomUUID(),
          name: data.name,
          description: data.description,
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublic: data.isPublic,
        };
        
        set((state) => ({
          readLists: [...state.readLists, newReadList],
          activeReadListId: state.activeReadListId || newReadList.id,
        }));
        
        return newReadList;
      },
      
      deleteReadList: (id: string) => {
        set((state) => ({
          readLists: state.readLists.filter((list) => list.id !== id),
          activeReadListId: state.activeReadListId === id ? 
            (state.readLists.length > 1 ? state.readLists.find(l => l.id !== id)?.id || null : null) : 
            state.activeReadListId,
        }));
      },
      
      updateReadList: (id: string, updates: Partial<ReadList>) => {
        set((state) => ({
          readLists: state.readLists.map((list) =>
            list.id === id
              ? { ...list, ...updates, updatedAt: new Date().toISOString() }
              : list
          ),
        }));
      },
      
      setActiveReadList: (id: string | null) => {
        set({ activeReadListId: id });
      },
      
      addItemToReadList: (readListId: string, item: Omit<ReadListItem, 'id' | 'addedAt' | 'isRead'>) => {
        const newItem: ReadListItem = {
          ...item,
          id: crypto.randomUUID(),
          addedAt: new Date().toISOString(),
          isRead: false,
        };
        
        set((state) => ({
          readLists: state.readLists.map((list) =>
            list.id === readListId
              ? {
                  ...list,
                  items: [...list.items, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        }));
      },
      
      removeItemFromReadList: (readListId: string, itemId: string) => {
        set((state) => ({
          readLists: state.readLists.map((list) =>
            list.id === readListId
              ? {
                  ...list,
                  items: list.items.filter((item) => item.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        }));
      },
      
      markItemAsRead: (readListId: string, itemId: string, isRead: boolean) => {
        set((state) => ({
          readLists: state.readLists.map((list) =>
            list.id === readListId
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.id === itemId ? { ...item, isRead } : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : list
          ),
        }));
      },
      
      getReadListById: (id: string) => {
        return get().readLists.find((list) => list.id === id);
      },
      
      getActiveReadList: () => {
        const { activeReadListId, readLists } = get();
        return activeReadListId ? readLists.find((list) => list.id === activeReadListId) : undefined;
      },
      
      isItemInAnyReadList: (url: string) => {
        return get().readLists.some((list) =>
          list.items.some((item) => item.url === url)
        );
      },
    }),
    {
      name: 'read-list-storage',
    }
  )
); 