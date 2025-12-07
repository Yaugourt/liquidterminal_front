import { DailyTaskType, WeeklyChallengeType } from './types';

/**
 * Maps daily task types to their corresponding routes
 */
export const DAILY_TASK_ROUTES: Record<DailyTaskType, string> = {
  LOGIN: '/dashboard',
  READ_RESOURCE: '/wiki',
  ADD_WALLET: '/market/tracker',
  EXPLORE_LEADERBOARD: '/profile?tab=leaderboard',
};

/**
 * Maps weekly challenge types to their corresponding routes
 */
export const WEEKLY_CHALLENGE_ROUTES: Record<WeeklyChallengeType, string> = {
  READ_20_RESOURCES: '/wiki',
  CREATE_5_READLISTS: '/wiki/readlist',
  LOGIN_7_DAYS: '/dashboard',
  ADD_15_WALLETS: '/market/tracker',
};

/**
 * Get the route for a daily task
 */
export function getDailyTaskRoute(taskType: DailyTaskType): string {
  return DAILY_TASK_ROUTES[taskType];
}

/**
 * Get the route for a weekly challenge
 */
export function getWeeklyChallengeRoute(challengeType: WeeklyChallengeType): string {
  return WEEKLY_CHALLENGE_ROUTES[challengeType];
}

