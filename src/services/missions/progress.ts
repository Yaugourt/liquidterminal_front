/**
 * Pure mission-progress helpers.
 *
 * Deliberately free of runtime imports (types only) so the logic can be
 * compiled and exercised in isolation (node self-check) and stays trivial
 * to unit-test later.
 */
import type {
  Mission,
  MissionCategory,
  MissionProgress,
} from "./types";

/** Minimal mission shape the pure helpers need (icon-free, test-friendly). */
export type MissionMeta = Pick<
  Mission,
  "id" | "xpReward" | "category" | "requiresAuth"
>;

const EMPTY_CATEGORY: Record<MissionCategory, { total: number; completed: number }> = {
  discover: { total: 0, completed: 0 },
  personalize: { total: 0, completed: 0 },
  engage: { total: 0, completed: 0 },
};

/**
 * Segment-boundary prefix match for route-visit missions.
 * `/market/spot` matches `/market/spot` and `/market/spot/HYPE`,
 * but NOT `/market/spotlight`.
 */
export function matchesTrackedRoute(
  pathname: string,
  trackedRoutes: readonly string[]
): boolean {
  return trackedRoutes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export interface ComputedMissions<M extends MissionMeta> {
  missions: (M & { completed: boolean; locked: boolean })[];
  progress: MissionProgress;
  /** First incomplete, unlocked mission in catalog order (null when none). */
  nextMission: (M & { completed: boolean; locked: boolean }) | null;
}

/**
 * Derives per-mission status and aggregated progress from the catalog,
 * the persisted completed ids and the auth state.
 */
export function computeMissionProgress<M extends MissionMeta>(
  catalog: readonly M[],
  completedMissionIds: readonly string[],
  authenticated: boolean
): ComputedMissions<M> {
  const completedSet = new Set(completedMissionIds);

  const missions = catalog.map((mission) => ({
    ...mission,
    completed: completedSet.has(mission.id),
    locked: mission.requiresAuth && !authenticated,
  }));

  const byCategory: Record<MissionCategory, { total: number; completed: number }> = {
    discover: { ...EMPTY_CATEGORY.discover },
    personalize: { ...EMPTY_CATEGORY.personalize },
    engage: { ...EMPTY_CATEGORY.engage },
  };

  let completedCount = 0;
  let totalXp = 0;
  let earnedXp = 0;

  for (const mission of missions) {
    byCategory[mission.category].total += 1;
    totalXp += mission.xpReward;
    if (mission.completed) {
      byCategory[mission.category].completed += 1;
      completedCount += 1;
      earnedXp += mission.xpReward;
    }
  }

  const total = missions.length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const nextMission =
    missions.find((m) => !m.completed && !m.locked) ?? null;

  return {
    missions,
    nextMission,
    progress: {
      total,
      completedCount,
      percent,
      allDone: total > 0 && completedCount === total,
      totalXp,
      earnedXp,
      byCategory,
    },
  };
}
