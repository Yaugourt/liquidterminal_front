/**
 * Missions domain types.
 *
 * Missions are the post-onboarding checklist: one-shot tasks that teach the
 * product by doing (visit key pages, use quick search, customize the sidebar,
 * track a wallet...). They kick in AFTER the first-login welcome tour
 * (`useOnboardingStore.hasCompletedOnboarding`).
 *
 * Distinct from the XP system's server-side daily tasks / weekly challenges
 * (`src/services/xp`): missions are client-side, completed once, persisted in
 * localStorage (`use-missions` store), and only mirror the XP look & feel
 * (xpReward chips) without calling the XP API.
 */
import type { LucideIcon } from "lucide-react";

/** Mission tiers, rendered as groups in the missions widget. */
export type MissionCategory = "discover" | "personalize" | "engage";

/** Closed set of mission ids — keeps `completeMission` calls typo-safe. */
export type MissionId =
  | "visit-dashboard"
  | "visit-market"
  | "visit-explorer"
  | "visit-wiki"
  | "open-search"
  | "customize-sidebar"
  | "connect-account"
  | "track-wallet"
  | "create-readlist";

/**
 * Client-side action triggered when the mission row is clicked, instead of
 * navigating to `href`:
 * - `open-search`: opens the global Cmd+K palette (`useGlobalSearch`).
 * - `login`: starts the Privy login flow (`useAuthContext().login`).
 */
export type MissionClientAction = "open-search" | "login";

export interface Mission {
  id: MissionId;
  title: string;
  description: string;
  /** Deep link to where the mission is performed. */
  href: string;
  icon: LucideIcon;
  /** Display-only reward, styled like XP chips (gold). Not wired to the XP API. */
  xpReward: number;
  category: MissionCategory;
  /** Mission can only be performed while logged in (rendered locked otherwise). */
  requiresAuth: boolean;
  /**
   * Route prefixes that auto-complete this mission on visit
   * (segment-boundary prefix match, see `matchesTrackedRoute`).
   * Omitted for missions tracked by store subscriptions or explicit calls.
   */
  trackedRoutes?: readonly string[];
  /** Optional in-place action instead of navigation (see MissionClientAction). */
  clientAction?: MissionClientAction;
}

/** Mission enriched with the user's completion / lock status. */
export interface MissionWithStatus extends Mission {
  completed: boolean;
  /** True when the mission requires auth and the user is not authenticated. */
  locked: boolean;
}

export interface MissionCategoryProgress {
  total: number;
  completed: number;
}

/** Aggregated progress across the whole catalog. */
export interface MissionProgress {
  total: number;
  completedCount: number;
  /** 0-100, rounded. */
  percent: number;
  allDone: boolean;
  /** Sum of all xpRewards in the catalog. */
  totalXp: number;
  /** Sum of xpRewards of completed missions. */
  earnedXp: number;
  byCategory: Record<MissionCategory, MissionCategoryProgress>;
}

/** Category group as rendered by the widget (ordered, labelled). */
export interface MissionCategoryGroup {
  category: MissionCategory;
  label: string;
  missions: MissionWithStatus[];
}

/** Assembled view returned by `useMissions` (catalog x progress x auth). */
export interface UseMissionsResult {
  missions: MissionWithStatus[];
  byCategory: MissionCategoryGroup[];
  progress: MissionProgress;
  /** First incomplete, unlocked mission in catalog order (null when done). */
  nextMission: MissionWithStatus | null;
}
