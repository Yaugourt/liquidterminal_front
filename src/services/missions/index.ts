/**
 * missions/ barrel — onboarding-missions domain layer.
 *
 * Client-side only (no api.ts): missions are completed locally and persisted
 * in localStorage (`@/store/use-missions`). See types.ts for the rationale.
 */
export type {
  Mission,
  MissionId,
  MissionCategory,
  MissionClientAction,
  MissionWithStatus,
  MissionCategoryGroup,
  MissionCategoryProgress,
  MissionProgress,
  UseMissionsResult,
} from "./types";

export {
  MISSIONS,
  MISSION_CATEGORY_LABELS,
  MISSION_CATEGORY_ORDER,
} from "./catalog";

export {
  computeMissionProgress,
  matchesTrackedRoute,
} from "./progress";
export type { MissionMeta, ComputedMissions } from "./progress";

export { useMissions } from "./hooks/useMissions";
