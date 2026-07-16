import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MissionId } from "@/services/missions/types";

/**
 * Onboarding-missions store — client-side completion state.
 *
 * Same persistence pattern as `use-sidebar-preferences`: zustand `persist`
 * over localStorage via `createJSONStorage` (SSR-safe: the storage getter is
 * only invoked in the browser; consumers gate rendering on mount).
 *
 * Mission definitions live in `src/services/missions/catalog.ts`;
 * this store only tracks which ids are done and the widget's UI state.
 */
interface MissionsState {
  /** Ids of completed missions (append-only, deduplicated). */
  completedMissionIds: string[];
  /** User permanently hid the missions widget. */
  dismissed: boolean;
  /** Widget is collapsed to its FAB pill. */
  panelCollapsed: boolean;
  /** The 100% celebration was seen and closed. */
  celebrationAcknowledged: boolean;

  /** Marks a mission as done. Idempotent — safe to call repeatedly. */
  completeMission: (id: MissionId) => void;
  /** Permanently hides the missions widget. */
  dismissMissions: () => void;
  /** Collapses/expands the floating panel. */
  togglePanel: () => void;
  setPanelCollapsed: (collapsed: boolean) => void;
  /** Closes the 100% celebration state. */
  acknowledgeCelebration: () => void;
  /** Dev helper — wipes all missions state back to defaults. */
  resetMissions: () => void;
}

const CURRENT_VERSION = 1;

export const useMissionsStore = create<MissionsState>()(
  persist(
    (set, get) => ({
      completedMissionIds: [],
      dismissed: false,
      panelCollapsed: true,
      celebrationAcknowledged: false,

      completeMission: (id: MissionId) => {
        const { completedMissionIds } = get();
        if (completedMissionIds.includes(id)) return;
        set({ completedMissionIds: [...completedMissionIds, id] });
      },

      dismissMissions: () => set({ dismissed: true }),

      togglePanel: () =>
        set((state) => ({ panelCollapsed: !state.panelCollapsed })),

      setPanelCollapsed: (collapsed: boolean) =>
        set({ panelCollapsed: collapsed }),

      acknowledgeCelebration: () => set({ celebrationAcknowledged: true }),

      resetMissions: () =>
        set({
          completedMissionIds: [],
          dismissed: false,
          panelCollapsed: true,
          celebrationAcknowledged: false,
        }),
    }),
    {
      name: "missions-storage",
      storage: createJSONStorage(() => localStorage),
      version: CURRENT_VERSION,
    }
  )
);

/**
 * Public imperative API — callable outside React (event handlers, services).
 *
 * Integration one-liner for action missions that can't be observed from the
 * URL or an existing store, e.g. in a modal's save handler:
 *
 * ```ts
 * import { markMissionComplete } from "@/store/use-missions";
 * markMissionComplete("customize-sidebar");
 * ```
 */
export function markMissionComplete(id: MissionId): void {
  useMissionsStore.getState().completeMission(id);
}
