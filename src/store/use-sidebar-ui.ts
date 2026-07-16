import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Sidebar UI state — desktop collapse (icon rail vs full width).
 *
 * Separate from `use-sidebar-preferences` (which owns nav content:
 * visibility/order of groups and items) so the two concerns evolve
 * independently: this one is pure chrome state.
 */
interface SidebarUiState {
  /** Desktop only — true renders the 64px icon rail, false the full 232px panel. */
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarUi = create<SidebarUiState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    {
      name: "sidebar-ui",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
