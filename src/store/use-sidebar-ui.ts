import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * How the families lay out in the expanded rail. All three keep the same nav
 * content — only the folding behaviour differs, so switching is lossless.
 *
 * - `collapsible` — several families open at once (default, OAK-style tree).
 * - `focus`       — exactly one family open; opening another closes the rest.
 * - `expanded`    — nothing folds, every item visible, headers lose the chevron.
 */
export type SidebarNavMode = "collapsible" | "focus" | "expanded";

/**
 * Sidebar UI state — desktop collapse (icon rail vs full width) and the
 * layout mode of the expanded rail.
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
  /** Layout of the expanded rail — see `SidebarNavMode`. */
  navMode: SidebarNavMode;
  setNavMode: (mode: SidebarNavMode) => void;
  /**
   * Ids of the families folded shut in the expanded rail (OAK-style tree).
   * Persisted so the fold survives reloads, like the rail collapse. The list
   * holds what is CLOSED, so the default below ships every family collapsed;
   * an absent id (e.g. a family added later) reads as open.
   *
   * Kept intact in `focus`/`expanded` mode even though those modes derive
   * their own fold state — going back to `collapsible` restores the user's
   * own folds rather than a reset.
   */
  foldedGroups: string[];
  /**
   * `allGroupIds` is only read in `focus` mode, where opening a family has to
   * fold every other one — the store has no view of the nav tree, so the
   * caller passes the ids it is rendering.
   */
  toggleGroup: (groupId: string, allGroupIds?: string[]) => void;
}

/**
 * Families collapsed on a fresh install. Ids come from `getGroupId` in
 * sidebar-config (groupName lowercased, spaces → dashes). Kept in sync with the
 * named groups of `defaultNavigationGroups`. Markets is intentionally absent —
 * it stays open on arrival so the primary destinations are visible immediately.
 */
const DEFAULT_FOLDED_GROUPS = ["capital", "chain", "ecosystem", "learn"];

/** Bump alongside a breaking change to the persisted shape, then extend `migrate`. */
const SIDEBAR_UI_VERSION = 2;

export const useSidebarUi = create<SidebarUiState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      navMode: "collapsible",
      setNavMode: (navMode) => set({ navMode }),
      foldedGroups: DEFAULT_FOLDED_GROUPS,
      toggleGroup: (groupId, allGroupIds) =>
        set((s) => {
          const isFolded = s.foldedGroups.includes(groupId);
          if (s.navMode === "focus" && allGroupIds) {
            // Opening folds every sibling; closing folds the lot.
            return {
              foldedGroups: isFolded ? allGroupIds.filter((id) => id !== groupId) : allGroupIds,
            };
          }
          return {
            foldedGroups: isFolded
              ? s.foldedGroups.filter((id) => id !== groupId)
              : [...s.foldedGroups, groupId],
          };
        }),
    }),
    {
      name: "sidebar-ui",
      storage: createJSONStorage(() => localStorage),
      // Bumped whenever the default fold set changes so persisted blobs don't
      // pin the old layout. v1: all families collapsed on load. v2: Markets
      // opens by default. Adding a field (e.g. `navMode`) needs no bump —
      // persist merges shallowly over the initial state, so an older blob
      // simply inherits the new field's default.
      version: SIDEBAR_UI_VERSION,
      /**
       * Without a migrate, zustand discards a mismatched blob AND logs
       * "State loaded from storage couldn't be migrated" — an error every
       * returning user saw on load.
       *
       * Returning only `collapsed` keeps the intent of the version bump: every
       * other field, `foldedGroups` included, falls back to the initial state,
       * so everyone still picks up the new default fold set once. The rail's
       * collapsed state is the one thing worth carrying across, and it is the
       * only field this store held before the families landed.
       */
      migrate: (persisted): Pick<SidebarUiState, "collapsed"> => {
        const collapsed = (persisted as Partial<SidebarUiState> | null)?.collapsed;
        return { collapsed: typeof collapsed === "boolean" ? collapsed : false };
      },
    }
  )
);
