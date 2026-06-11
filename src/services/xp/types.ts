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

// ============================================
// DAILY TASKS TYPES
// ============================================

export type DailyTaskType =
  | 'LOGIN'
  | 'READ_RESOURCE'
  | 'ADD_WALLET'
  | 'EXPLORE_LEADERBOARD'
  | 'SUBMIT_RESOURCE'
  | 'CREATE_READLIST'
  | 'CREATE_WALLETLIST';

export interface DailyTask {
  type: DailyTaskType;
  description: string;
  xp: number;
  completed: boolean;
  completedAt: string | null;
}

export interface DailyTasksResponse {
  success: boolean;
  data: {
    tasks: DailyTask[];
    allCompleted: boolean;
    bonusXp: number;
    bonusClaimed: boolean;
  };
}

export interface CompleteDailyTaskResponse {
  success: boolean;
  message: string;
  data: {
    xpGranted: number;
    allTasksCompleted: boolean;
    bonusGranted: number;
  };
}

// ============================================
// WEEKLY CHALLENGES TYPES
// ============================================

export type WeeklyChallengeType =
  | 'READ_20_RESOURCES'
  | 'CREATE_5_READLISTS'
  | 'LOGIN_7_DAYS'
  | 'ADD_15_WALLETS';

export interface WeeklyChallenge {
  type: WeeklyChallengeType;
  description: string;
  progress: number;
  target: number;
  progressPercent: number;
  xpReward: number;
  completed: boolean;
  completedAt: string | null;
}

export interface WeeklyChallengesResponse {
  success: boolean;
  data: {
    challenges: WeeklyChallenge[];
    weekStart: string;
    weekEnd: string;
  };
}

// ============================================
// DAILY LIMITS TYPES (Anti-Farm)
// ============================================

export type LimitedActionType =
  | 'CREATE_READLIST'
  | 'MARK_RESOURCE_READ'
  | 'CREATE_WALLETLIST'
  | 'ADD_WALLET_TO_LIST'
  | 'COPY_PUBLIC_READLIST'
  | 'CREATE_EDUCATIONAL_CATEGORY'
  | 'ADD_EDUCATIONAL_RESOURCE';

export interface DailyLimit {
  actionType: LimitedActionType;
  used: number;
  max: number;
  remaining: number;
  xpPerAction: number;
}

export interface DailyLimitsResponse {
  success: boolean;
  data: {
    limits: DailyLimit[];
  };
}

// Daily limit labels for display
export const DAILY_LIMIT_LABELS: Record<LimitedActionType, string> = {
  CREATE_READLIST: 'Create readlist',
  MARK_RESOURCE_READ: 'Resources read',
  CREATE_WALLETLIST: 'Create wallet list',
  ADD_WALLET_TO_LIST: 'Wallets added',
  COPY_PUBLIC_READLIST: 'Copy readlist',
  CREATE_EDUCATIONAL_CATEGORY: 'Educational categories',
  ADD_EDUCATIONAL_RESOURCE: 'Educational resources',
};

