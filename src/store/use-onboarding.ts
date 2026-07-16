import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Onboarding store — public contract.
 *
 * Consumed by the first-login welcome tour (`src/components/onboarding/`)
 * and by downstream gamification layers (missions system) that unlock once
 * onboarding is finished. Treat the exported state/actions as a stable API.
 *
 * Persistence: localStorage via zustand/persist (same pattern as
 * `use-sidebar-preferences`). SSR-safe: `createJSONStorage` defers the
 * `localStorage` access to the client; components must still gate rendering
 * on a `hasMounted` flag to avoid hydration mismatches (see
 * `OnboardingGate`).
 */
interface OnboardingState {
  /**
   * True once the user finished OR skipped the welcome tour.
   * Downstream layers (missions, prompts) unlock on this flag either way.
   */
  hasCompletedOnboarding: boolean;
  /** True once the welcome tour has been displayed at least once. */
  hasSeenWelcome: boolean;
  /** Current step index inside the tour (0-based). Persisted so a closed tab resumes where it left off. */
  currentStep: number;

  /** Marks onboarding as completed (primary CTA "Start exploring"). */
  completeOnboarding: () => void;
  /**
   * Skips the tour. Also sets `hasCompletedOnboarding` to true so
   * downstream layers unlock either way — skipping is a valid completion.
   */
  skipOnboarding: () => void;
  /** Jumps to a specific step (0-based). */
  setStep: (step: number) => void;
  /** Dev/testing helper: resets all flags so the tour shows again. */
  resetOnboarding: () => void;
}

/** Bump when the persisted shape changes (zustand persist migration hook). */
const CURRENT_VERSION = 1;

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      hasSeenWelcome: false,
      currentStep: 0,

      completeOnboarding: () =>
        set({
          hasCompletedOnboarding: true,
          hasSeenWelcome: true,
        }),

      skipOnboarding: () =>
        set({
          hasCompletedOnboarding: true,
          hasSeenWelcome: true,
        }),

      setStep: (step: number) => set({ currentStep: step }),

      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          hasSeenWelcome: false,
          currentStep: 0,
        }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => localStorage),
      version: CURRENT_VERSION,
    }
  )
);
