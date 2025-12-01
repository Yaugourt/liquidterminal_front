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
};

