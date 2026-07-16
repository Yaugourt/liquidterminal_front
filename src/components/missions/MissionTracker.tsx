"use client";

/**
 * Headless mission auto-completion tracker. Renders nothing.
 *
 * Mounted once by <MissionsGate />. Observes existing app state without
 * touching any existing file:
 * - route visits            -> usePathname() vs Mission.trackedRoutes
 * - Privy login             -> "connect-account"
 * - Cmd+K palette opened    -> useGlobalSearch store ("open-search")
 * - sidebar customized      -> useSidebarPreferences subscription ("customize-sidebar")
 * - wallet tracked          -> useWallets store ("track-wallet")
 * - read list created       -> useReadLists store ("create-readlist")
 *
 * All completions go through markMissionComplete(), which is idempotent.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { markMissionComplete, useMissionsStore } from "@/store/use-missions";
import { useGlobalSearch } from "@/store/use-global-search";
import { useSidebarPreferences } from "@/store/use-sidebar-preferences";
import { useWallets } from "@/store/use-wallets";
import { useReadLists } from "@/store/use-readlists";
import { MISSIONS, matchesTrackedRoute } from "@/services/missions";

export function MissionTracker() {
  const pathname = usePathname();
  const { ready, authenticated } = usePrivy();
  const completedMissionIds = useMissionsStore((s) => s.completedMissionIds);
  const searchOpen = useGlobalSearch((s) => s.open);
  const walletCount = useWallets((s) => s.wallets.length);
  const readListCount = useReadLists((s) => s.readLists.length);

  const isAuthed = ready && authenticated;

  // Route-visit missions.
  useEffect(() => {
    if (!pathname) return;
    for (const mission of MISSIONS) {
      if (!mission.trackedRoutes) continue;
      if (completedMissionIds.includes(mission.id)) continue;
      if (matchesTrackedRoute(pathname, mission.trackedRoutes)) {
        markMissionComplete(mission.id);
      }
    }
  }, [pathname, completedMissionIds]);

  // Privy login -> connect-account.
  useEffect(() => {
    if (isAuthed) markMissionComplete("connect-account");
  }, [isAuthed]);

  // Cmd+K palette opened -> open-search.
  useEffect(() => {
    if (searchOpen) markMissionComplete("open-search");
  }, [searchOpen]);

  // Wallet added to tracker (store is populated only for logged-in users).
  useEffect(() => {
    if (isAuthed && walletCount > 0) markMissionComplete("track-wallet");
  }, [isAuthed, walletCount]);

  // Read list created.
  useEffect(() => {
    if (isAuthed && readListCount > 0) markMissionComplete("create-readlist");
  }, [isAuthed, readListCount]);

  // Sidebar customized: any preference change after initialization.
  // JSON comparison filters out the no-op merge that
  // initializePreferences() performs on every app boot.
  useEffect(() => {
    const unsubscribe = useSidebarPreferences.subscribe((state, prevState) => {
      if (!prevState.preferences || !state.preferences) return;
      if (
        JSON.stringify(prevState.preferences) !==
        JSON.stringify(state.preferences)
      ) {
        markMissionComplete("customize-sidebar");
      }
    });
    return unsubscribe;
  }, []);

  return null;
}
