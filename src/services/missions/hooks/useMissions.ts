"use client";

/**
 * Assembled missions view: catalog x persisted progress x auth state.
 *
 * Uses Privy directly (like XpProvider) so it works anywhere under
 * PrivyProvider, without requiring AuthContext.
 */
import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useMissionsStore } from "@/store/use-missions";
import {
  MISSIONS,
  MISSION_CATEGORY_LABELS,
  MISSION_CATEGORY_ORDER,
} from "../catalog";
import { computeMissionProgress } from "../progress";
import type { UseMissionsResult } from "../types";

export function useMissions(): UseMissionsResult {
  const { ready, authenticated } = usePrivy();
  const completedMissionIds = useMissionsStore((s) => s.completedMissionIds);

  return useMemo(() => {
    const isAuthed = ready && authenticated;
    const { missions, progress, nextMission } = computeMissionProgress(
      MISSIONS,
      completedMissionIds,
      isAuthed
    );

    const byCategory = MISSION_CATEGORY_ORDER.map((category) => ({
      category,
      label: MISSION_CATEGORY_LABELS[category],
      missions: missions.filter((m) => m.category === category),
    }));

    return { missions, byCategory, progress, nextMission };
  }, [ready, authenticated, completedMissionIds]);
}
