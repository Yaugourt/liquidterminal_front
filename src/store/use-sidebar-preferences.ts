import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Types for sidebar customization
 */
export interface SidebarItemPreference {
  id: string; // unique identifier (e.g., "tracker", "my-wallets")
  visible: boolean;
  order: number;
}

export interface SidebarGroupPreference {
  id: string; // unique identifier (e.g., "liquid-market", "home")
  visible: boolean;
  order: number;
  items: SidebarItemPreference[];
}

export interface SidebarPreferences {
  version: number; // for future migrations
  groups: SidebarGroupPreference[];
}

interface SidebarPreferencesState {
  preferences: SidebarPreferences | null;
  
  // Actions
  initializePreferences: (defaultPreferences: SidebarPreferences) => void;
  updateGroupVisibility: (groupId: string, visible: boolean) => void;
  updateItemVisibility: (groupId: string, itemId: string, visible: boolean) => void;
  reorderGroups: (newOrder: string[]) => void;
  reorderItems: (groupId: string, newOrder: string[]) => void;
  resetToDefault: (defaultPreferences: SidebarPreferences) => void;
  getPreferences: () => SidebarPreferences | null;
}

const CURRENT_VERSION = 1;

export const useSidebarPreferences = create<SidebarPreferencesState>()(
  persist(
    (set, get) => ({
      preferences: null,
      
      initializePreferences: (defaultPreferences: SidebarPreferences) => {
        const current = get().preferences;
        
        // If no preferences exist or version mismatch, use default
        if (!current || current.version !== CURRENT_VERSION) {
          set({ preferences: defaultPreferences });
          return;
        }
        
        // Merge with default to handle new items/groups added
        const mergedGroups = defaultPreferences.groups.map((defaultGroup) => {
          const existingGroup = current.groups.find(g => g.id === defaultGroup.id);
          
          if (!existingGroup) {
            return defaultGroup;
          }
          
          // Merge items
          const mergedItems = defaultGroup.items.map((defaultItem) => {
            const existingItem = existingGroup.items.find(i => i.id === defaultItem.id);
            return existingItem || defaultItem;
          });
          
          return {
            ...existingGroup,
            items: mergedItems
          };
        });
        
        set({
          preferences: {
            version: CURRENT_VERSION,
            groups: mergedGroups
          }
        });
      },
      
      updateGroupVisibility: (groupId: string, visible: boolean) => {
        const prefs = get().preferences;
        if (!prefs) return;
        
        const updatedGroups = prefs.groups.map(group =>
          group.id === groupId ? { ...group, visible } : group
        );
        
        set({
          preferences: {
            ...prefs,
            groups: updatedGroups
          }
        });
      },
      
      updateItemVisibility: (groupId: string, itemId: string, visible: boolean) => {
        const prefs = get().preferences;
        if (!prefs) return;
        
        const updatedGroups = prefs.groups.map(group => {
          if (group.id !== groupId) return group;
          
          const updatedItems = group.items.map(item =>
            item.id === itemId ? { ...item, visible } : item
          );
          
          return { ...group, items: updatedItems };
        });
        
        set({
          preferences: {
            ...prefs,
            groups: updatedGroups
          }
        });
      },
      
      reorderGroups: (newOrder: string[]) => {
        const prefs = get().preferences;
        if (!prefs) return;
        
        const groupsMap = new Map(prefs.groups.map(g => [g.id, g]));
        const reorderedGroups = newOrder
          .map((id, index) => {
            const group = groupsMap.get(id);
            return group ? { ...group, order: index } : null;
          })
          .filter((g): g is SidebarGroupPreference => g !== null);
        
        set({
          preferences: {
            ...prefs,
            groups: reorderedGroups
          }
        });
      },
      
      reorderItems: (groupId: string, newOrder: string[]) => {
        const prefs = get().preferences;
        if (!prefs) return;
        
        const updatedGroups = prefs.groups.map(group => {
          if (group.id !== groupId) return group;
          
          const itemsMap = new Map(group.items.map(i => [i.id, i]));
          const reorderedItems = newOrder
            .map((id, index) => {
              const item = itemsMap.get(id);
              return item ? { ...item, order: index } : null;
            })
            .filter((i): i is SidebarItemPreference => i !== null);
          
          return { ...group, items: reorderedItems };
        });
        
        set({
          preferences: {
            ...prefs,
            groups: updatedGroups
          }
        });
      },
      
      resetToDefault: (defaultPreferences: SidebarPreferences) => {
        set({ preferences: defaultPreferences });
      },
      
      getPreferences: () => {
        return get().preferences;
      }
    }),
    {
      name: "sidebar-preferences-storage",
      storage: createJSONStorage(() => localStorage),
      version: CURRENT_VERSION,
    }
  )
);

