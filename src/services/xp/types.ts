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

// ============================================
// DAILY TASKS TYPES
// ============================================

export type DailyTaskType = 
  | 'LOGIN'
  | 'READ_RESOURCE'
  | 'ADD_WALLET'
  | 'EXPLORE_LEADERBOARD';

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

// Daily task labels for display
export const DAILY_TASK_LABELS: Record<DailyTaskType, string> = {
  LOGIN: 'Log in',
  READ_RESOURCE: 'Read a resource',
  ADD_WALLET: 'Add a wallet',
  EXPLORE_LEADERBOARD: 'Explore the leaderboard',
};

// Daily task icons (lucide icon names)
export const DAILY_TASK_ICONS: Record<DailyTaskType, string> = {
  LOGIN: 'log-in',
  READ_RESOURCE: 'book-open',
  ADD_WALLET: 'wallet',
  EXPLORE_LEADERBOARD: 'trophy',
};

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

// Weekly challenge labels for display
export const WEEKLY_CHALLENGE_LABELS: Record<WeeklyChallengeType, string> = {
  READ_20_RESOURCES: 'Read 20 resources',
  CREATE_5_READLISTS: 'Create 5 readlists',
  LOGIN_7_DAYS: 'Log in 7 days in a row',
  ADD_15_WALLETS: 'Add 15 wallets',
};

// Weekly challenge icons (lucide icon names)
export const WEEKLY_CHALLENGE_ICONS: Record<WeeklyChallengeType, string> = {
  READ_20_RESOURCES: 'book-open',
  CREATE_5_READLISTS: 'list-plus',
  LOGIN_7_DAYS: 'calendar-check',
  ADD_15_WALLETS: 'wallet',
};

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

