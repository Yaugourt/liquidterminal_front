import { create } from "zustand";

/** Open state of the donation card (the header heart and the timed prompt share it). */
interface DonateUiState {
  open: boolean;
  /** "prompt" when the timed nudge opened it, "button" when the user asked. */
  source: "prompt" | "button" | null;
  show: (source: "prompt" | "button") => void;
  hide: () => void;
}

export const useDonateUi = create<DonateUiState>((set) => ({
  open: false,
  source: null,
  show: (source) => set({ open: true, source }),
  hide: () => set({ open: false, source: null }),
}));
