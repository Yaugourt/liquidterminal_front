// XP System Types

export interface XpStats {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpToNextLevel: number;
  loginStreak: number;
  lastLoginAt: string | null;
}

export interface XpStatsResponse {
  success: boolean;
  data: XpStats;
}

export interface DailyLoginData {
  xpGranted: number;
  streakBonus: number;
  newStreak: number;
}

export interface DailyLoginResponse {
  success: boolean;
  message: string;
  data: DailyLoginData;
}

export interface XpTransaction {
  id: number;
  actionType: XpActionType;
  xpAmount: number;
  description: string | null;
  createdAt: string;
}

export interface XpHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface XpHistoryResponse {
  success: boolean;
  data: {
    transactions: XpTransaction[];
    pagination: XpHistoryPagination;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  totalXp: number;
  level: number;
}

export interface XpLeaderboardResponse {
  success: boolean;
  data: {
    leaderboard: LeaderboardEntry[];
    userRank?: number;
    total: number;
  };
}

export type XpActionType =
  | 'REGISTRATION'
  | 'DAILY_LOGIN'
  | 'LOGIN_STREAK_7'
  | 'LOGIN_STREAK_30'
  | 'REFERRAL_SUCCESS'
  | 'CREATE_READLIST'
  | 'MARK_RESOURCE_READ'
  | 'COPY_PUBLIC_READLIST'
  | 'CREATE_WALLETLIST'
  | 'ADD_WALLET_TO_LIST'
  | 'SUBMIT_PUBLIC_GOOD'
  | 'PUBLIC_GOOD_APPROVED';

// XP amounts per action (for reference)
export const XP_AMOUNTS: Record<XpActionType, number> = {
  REGISTRATION: 100,
  DAILY_LOGIN: 10,
  LOGIN_STREAK_7: 50,
  LOGIN_STREAK_30: 200,
  REFERRAL_SUCCESS: 200,
  CREATE_READLIST: 15,
  MARK_RESOURCE_READ: 5,
  COPY_PUBLIC_READLIST: 10,
  CREATE_WALLETLIST: 15,
  ADD_WALLET_TO_LIST: 10,
  SUBMIT_PUBLIC_GOOD: 100,
  PUBLIC_GOOD_APPROVED: 500,
};

// Action type labels for display
export const XP_ACTION_LABELS: Record<XpActionType, string> = {
  REGISTRATION: 'Welcome Bonus',
  DAILY_LOGIN: 'Daily Login',
  LOGIN_STREAK_7: '7-Day Streak',
  LOGIN_STREAK_30: '30-Day Streak',
  REFERRAL_SUCCESS: 'Referral Bonus',
  CREATE_READLIST: 'Created Readlist',
  MARK_RESOURCE_READ: 'Resource Read',
  COPY_PUBLIC_READLIST: 'Copied Readlist',
  CREATE_WALLETLIST: 'Created Wallet List',
  ADD_WALLET_TO_LIST: 'Added Wallet',
  SUBMIT_PUBLIC_GOOD: 'Submitted Public Good',
  PUBLIC_GOOD_APPROVED: 'Public Good Approved',
};

// Action type icons (lucide icon names)
export const XP_ACTION_ICONS: Record<XpActionType, string> = {
  REGISTRATION: 'gift',
  DAILY_LOGIN: 'calendar-check',
  LOGIN_STREAK_7: 'flame',
  LOGIN_STREAK_30: 'flame',
  REFERRAL_SUCCESS: 'users',
  CREATE_READLIST: 'book-plus',
  MARK_RESOURCE_READ: 'book-open-check',
  COPY_PUBLIC_READLIST: 'copy',
  CREATE_WALLETLIST: 'wallet',
  ADD_WALLET_TO_LIST: 'wallet',
  SUBMIT_PUBLIC_GOOD: 'send',
  PUBLIC_GOOD_APPROVED: 'check-circle',
};

