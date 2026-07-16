"use client";

import { useEffect, useState } from "react";
import { useLogin } from "@privy-io/react-auth";
import { useOnboardingStore } from "@/store/use-onboarding";
import { OnboardingTour } from "./OnboardingTour";

/** Small delay so the app shell paints before the tour fades in. */
const SHOW_DELAY_MS = 600;

/**
 * Single mount point for the first-login onboarding experience.
 *
 * Renders nothing once onboarding is completed/skipped. Drop it once into
 * the app-group layout (`src/app/(app)/layout.tsx`), as a sibling of the
 * main content — it portals its own overlay.
 *
 * Show triggers (both gated on `hasCompletedOnboarding === false`):
 * 1. Persisted flag: `hasSeenWelcome === false` → first visit on this
 *    browser (anonymous or not). A returning visitor never sees it again.
 * 2. Privy `useLogin.onComplete` with `isNewUser === true` → a visitor who
 *    had already seen the welcome (but never finished/skipped it) signs up
 *    for the first time and still gets the tour once.
 */
export function OnboardingGate() {
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);
  const hasSeenWelcome = useOnboardingStore((s) => s.hasSeenWelcome);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const skipOnboarding = useOnboardingStore((s) => s.skipOnboarding);

  // Hydration guard: the persisted store is only trustworthy on the client
  // after mount (same pattern as Sidebar.tsx). Prevents SSR/CSR mismatch
  // and a flash of the tour for users who already dismissed it.
  const [hasMounted, setHasMounted] = useState(false);
  const [open, setOpen] = useState(false);
  /** Set when a brand-new Privy account logs in — secondary trigger. */
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Secondary trigger: authenticated first login. `useLogin` callbacks fire
  // for any login completion under the PrivyProvider, so no existing login
  // button needs to change.
  useLogin({
    onComplete: ({ isNewUser, wasAlreadyAuthenticated }) => {
      if (
        isNewUser &&
        !wasAlreadyAuthenticated &&
        !useOnboardingStore.getState().hasCompletedOnboarding
      ) {
        setForceShow(true);
      }
    },
  });

  useEffect(() => {
    if (!hasMounted || hasCompletedOnboarding || open) return;
    if (hasSeenWelcome && !forceShow) return;

    const timer = setTimeout(() => {
      setOpen(true);
      // Mark as seen the moment the tour is actually displayed. Uses
      // direct setState to keep the store's public action surface minimal.
      useOnboardingStore.setState({ hasSeenWelcome: true });
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hasMounted, hasCompletedOnboarding, hasSeenWelcome, forceShow, open]);

  const handleComplete = () => {
    setOpen(false);
    completeOnboarding();
  };

  const handleSkip = () => {
    setOpen(false);
    skipOnboarding();
  };

  // Nothing to render server-side or once onboarding is done and closed.
  if (!hasMounted || (hasCompletedOnboarding && !open)) return null;

  return <OnboardingTour open={open} onComplete={handleComplete} onSkip={handleSkip} />;
}
