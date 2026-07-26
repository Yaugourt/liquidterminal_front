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

/** Bump alongside a breaking change to the persisted shape, then extend `migrate`. */
const SIDEBAR_UI_VERSION = 0;

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
      version: SIDEBAR_UI_VERSION,
      /**
       * Entries written before this store carried a version have no `version`
       * field at all, and zustand compares it strictly: `undefined !== 0`
       * counts as a mismatch, so without a migrate it discards the state and
       * logs "State loaded from storage couldn't be migrated".
       *
       * `collapsed` is the only field this store has ever held, so salvage it
       * when it is a boolean and fall back to the expanded rail otherwise.
       */
      migrate: (persisted): Pick<SidebarUiState, "collapsed"> => {
        const collapsed = (persisted as Partial<SidebarUiState> | null)?.collapsed;
        return { collapsed: typeof collapsed === "boolean" ? collapsed : false };
      },
    }
  )
);
