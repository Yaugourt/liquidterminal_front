import { get, post } from '../api/axios-config';
import { withErrorHandling } from '../api/error-handler';
import {
  XpStatsResponse,
  XpStats,
  DailyLoginResponse,
  DailyLoginData,
  XpHistoryResponse,
  XpTransaction,
  XpHistoryPagination,
  XpLeaderboardResponse,
  LeaderboardEntry,
  XpActionType,
  DailyTasksResponse,
  DailyTask,
  DailyTaskType,
  CompleteDailyTaskResponse,
  WeeklyChallengesResponse,
  WeeklyChallenge,
  DailyLimitsResponse,
  DailyLimit,
} from './types';

export interface XpHistoryParams {
  page?: number;
  limit?: number;
  actionType?: XpActionType;
}

export interface LeaderboardParams {
  page?: number;
  limit?: number;
}

export const xpService = {
  /**
   * Get current user's XP stats
   * Requires authentication
   */
  getStats: async (): Promise<XpStats> => {
    return withErrorHandling(async () => {
      const response = await get<XpStatsResponse>('/xp/stats');
      return response.data;
    }, 'fetching XP stats');
  },

  /**
   * Register daily login and get XP
   * Should be called once per day when user connects
   * Idempotent - multiple calls same day only grant XP once
   */
  dailyLogin: async (): Promise<DailyLoginData> => {
    return withErrorHandling(async () => {
      const response = await post<DailyLoginResponse>('/xp/daily-login');
      return response.data;
    }, 'registering daily login');
  },

  /**
   * Get user's XP transaction history
   * Requires authentication
   */
  getHistory: async (params?: XpHistoryParams): Promise<{
    transactions: XpTransaction[];
    pagination: XpHistoryPagination;
  }> => {
    return withErrorHandling(async () => {
      const response = await get<XpHistoryResponse>('/xp/history', params as Record<string, unknown>);
      return response.data;
    }, 'fetching XP history');
  },

  /**
   * Get XP leaderboard
   * Public endpoint - no auth required
   * userRank is only present if user is authenticated
   */
  getLeaderboard: async (params?: LeaderboardParams): Promise<{
    leaderboard: LeaderboardEntry[];
    userRank?: number;
    total: number;
  }> => {
    return withErrorHandling(async () => {
      const response = await get<XpLeaderboardResponse>('/xp/leaderboard', params as Record<string, unknown>);
      return response.data;
    }, 'fetching leaderboard');
  },

  // ============================================
  // DAILY TASKS
  // ============================================

  /**
   * Get daily tasks status
   * Returns the 4 daily tasks with completion status
   */
  getDailyTasks: async (): Promise<{
    tasks: DailyTask[];
    allCompleted: boolean;
    bonusXp: number;
    bonusClaimed: boolean;
  }> => {
    return withErrorHandling(async () => {
      const response = await get<DailyTasksResponse>('/xp/daily-tasks');
      return response.data;
    }, 'fetching daily tasks');
  },

  /**
   * Complete a daily task manually
   * Only EXPLORE_LEADERBOARD can be completed manually
   * Other tasks are completed automatically by the backend
   */
  completeDailyTask: async (taskType: DailyTaskType): Promise<{
    xpGranted: number;
    allTasksCompleted: boolean;
    bonusGranted: number;
  }> => {
    return withErrorHandling(async () => {
      const response = await post<CompleteDailyTaskResponse>(`/xp/daily-tasks/${taskType}`);
      return response.data;
    }, 'completing daily task');
  },

  // ============================================
  // WEEKLY CHALLENGES
  // ============================================

  /**
   * Get weekly challenges status
   * Returns the 4 weekly challenges with progress
   */
  getWeeklyChallenges: async (): Promise<{
    challenges: WeeklyChallenge[];
    weekStart: string;
    weekEnd: string;
  }> => {
    return withErrorHandling(async () => {
      const response = await get<WeeklyChallengesResponse>('/xp/weekly-challenges');
      return response.data;
    }, 'fetching weekly challenges');
  },

  // ============================================
  // DAILY LIMITS (Anti-Farm)
  // ============================================

  /**
   * Get daily limits status
   * Returns remaining actions for each limited action type
   */
  getDailyLimits: async (): Promise<{
    limits: DailyLimit[];
  }> => {
    return withErrorHandling(async () => {
      const response = await get<DailyLimitsResponse>('/xp/daily-limits');
      return response.data;
    }, 'fetching daily limits');
  },
};

