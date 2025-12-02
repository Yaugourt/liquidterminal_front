// XP Service exports
export { xpService } from './api';
export type { XpHistoryParams, LeaderboardParams } from './api';

// Types
export * from './types';

// Context
export { XpProvider, useXpContext } from './context';

// Hooks
export { useXp } from './hooks/useXp';
export { useXpLeaderboard } from './hooks/useXpLeaderboard';
export { useDailyTasks } from './hooks/useDailyTasks';
export { useWeeklyChallenges } from './hooks/useWeeklyChallenges';
export { useDailyLimits } from './hooks/useDailyLimits';

