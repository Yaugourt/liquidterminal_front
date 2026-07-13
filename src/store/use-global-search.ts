import { create } from "zustand";

interface GlobalSearchState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

/** Open/close state of the global search palette (Cmd+K). */
export const useGlobalSearch = create<GlobalSearchState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
