"use client";

/**
 * Single integration mount point for the missions layer.
 *
 * Mount once inside the app shell (e.g. next to <Toaster /> in
 * Providers.tsx — must live under PrivyProvider + AuthProvider). Renders
 * nothing until:
 * - the client has mounted (SSR-safe: persisted stores need localStorage),
 * - the welcome tour is finished (`useOnboardingStore.hasCompletedOnboarding`),
 * - the user hasn't dismissed the widget,
 * - and missions aren't all done + celebrated.
 */
import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/store/use-onboarding";
import { useMissionsStore } from "@/store/use-missions";
import { useMissions } from "@/services/missions";
import { MissionTracker } from "./MissionTracker";
import { MissionsWidget } from "./MissionsWidget";

export function MissionsGate() {
  // Render nothing on the server and on the hydration pass — the widget
  // depends on localStorage-persisted stores.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding
  );
  const dismissed = useMissionsStore((s) => s.dismissed);
  const celebrationAcknowledged = useMissionsStore(
    (s) => s.celebrationAcknowledged
  );
  const { progress } = useMissions();

  if (!mounted || !hasCompletedOnboarding || dismissed) return null;
  if (progress.allDone && celebrationAcknowledged) return null;

  return (
    <>
      <MissionTracker />
      <MissionsWidget />
    </>
  );
}
