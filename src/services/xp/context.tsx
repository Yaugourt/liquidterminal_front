"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { xpService } from './api';
import { 
  XpStats, 
  DailyLoginData, 
  DailyTask, 
  WeeklyChallenge, 
  DailyLimit,
  DailyTaskType,
} from './types';

// Storage key for tracking daily login
const DAILY_LOGIN_KEY = 'xp_daily_login_date';

interface XpContextValue {
  // Stats
  stats: XpStats | null;
  isLoading: boolean;
  error: Error | null;
  lastLoginResult: DailyLoginData | null;
  refetch: () => Promise<void>;
  
  // Daily Tasks
  dailyTasks: DailyTask[];
  allDailyTasksCompleted: boolean;
  dailyBonusXp: number;
  dailyBonusClaimed: boolean;
  dailyTasksCompletedCount: number;
  completeDailyTask: (taskType: DailyTaskType) => Promise<{
    xpGranted: number;
    allTasksCompleted: boolean;
    bonusGranted: number;
  } | null>;
  refetchDailyTasks: () => Promise<void>;
  
  // Weekly Challenges
  weeklyChallenges: WeeklyChallenge[];
  weekStart: string | null;
  weekEnd: string | null;
  timeUntilWeeklyReset: string;
  refetchWeeklyChallenges: () => Promise<void>;
  
  // Daily Limits
  dailyLimits: DailyLimit[];
  hasReachedLimit: (actionType: string) => boolean;
  limitsReached: string[];
  refetchDailyLimits: () => Promise<void>;
  
  // Refetch all XP data
  refetchAll: () => Promise<void>;
}

const XpContext = createContext<XpContextValue | null>(null);

function formatTimeUntilReset(weekEnd: string | null): string {
  if (!weekEnd) return '';
  
  const end = new Date(weekEnd);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Resetting...';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  return `${hours}h`;
}

export function XpProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated } = usePrivy();
  
  // Stats state
  const [stats, setStats] = useState<XpStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastLoginResult, setLastLoginResult] = useState<DailyLoginData | null>(null);

  // Daily Tasks state
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [allDailyTasksCompleted, setAllDailyTasksCompleted] = useState(false);
  const [dailyBonusXp, setDailyBonusXp] = useState(15);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);

  // Weekly Challenges state
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [weekEnd, setWeekEnd] = useState<string | null>(null);
  const [timeUntilWeeklyReset, setTimeUntilWeeklyReset] = useState('');

  // Daily Limits state
  const [dailyLimits, setDailyLimits] = useState<DailyLimit[]>([]);

  // Track if daily login has been attempted this session
  const dailyLoginAttempted = useRef(false);

  // Check if we already logged in today (local storage)
  const hasLoggedInToday = useCallback((): boolean => {
    if (typeof window === 'undefined') return true;
    const lastLogin = localStorage.getItem(DAILY_LOGIN_KEY);
    if (!lastLogin) return false;

    const today = new Date().toDateString();
    return lastLogin === today;
  }, []);

  // Mark today as logged in
  const markLoggedInToday = useCallback(() => {
    if (typeof window === 'undefined') return;
    const today = new Date().toDateString();
    localStorage.setItem(DAILY_LOGIN_KEY, today);
  }, []);

  // Fetch XP stats
  const fetchStats = useCallback(async () => {
    if (!ready || !authenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await xpService.getStats();
      setStats(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch XP stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ready, authenticated]);

  // Fetch Daily Tasks
  const fetchDailyTasks = useCallback(async () => {
    if (!ready || !authenticated) return;

    try {
      const data = await xpService.getDailyTasks();
      setDailyTasks(data.tasks);
      setAllDailyTasksCompleted(data.allCompleted);
      setDailyBonusXp(data.bonusXp);
      setDailyBonusClaimed(data.bonusClaimed);
    } catch (err) {
      console.error('Failed to fetch daily tasks:', err);
    }
  }, [ready, authenticated]);

  // Fetch Weekly Challenges
  const fetchWeeklyChallenges = useCallback(async () => {
    if (!ready || !authenticated) return;

    try {
      const data = await xpService.getWeeklyChallenges();
      setWeeklyChallenges(data.challenges);
      setWeekStart(data.weekStart);
      setWeekEnd(data.weekEnd);
    } catch (err) {
      console.error('Failed to fetch weekly challenges:', err);
    }
  }, [ready, authenticated]);

  // Fetch Daily Limits
  const fetchDailyLimits = useCallback(async () => {
    if (!ready || !authenticated) return;

    try {
      const data = await xpService.getDailyLimits();
      setDailyLimits(data.limits);
    } catch (err) {
      console.error('Failed to fetch daily limits:', err);
    }
  }, [ready, authenticated]);

  // Complete a daily task
  const completeDailyTask = useCallback(async (taskType: DailyTaskType) => {
    if (!ready || !authenticated) return null;

    try {
      const result = await xpService.completeDailyTask(taskType);
      // Refetch to get updated state
      await fetchDailyTasks();
      if (result.xpGranted > 0) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to complete daily task:', err);
      return null;
    }
  }, [ready, authenticated, fetchDailyTasks, fetchStats]);

  // Handle daily login
  const handleDailyLogin = useCallback(async () => {
    if (!ready || !authenticated || dailyLoginAttempted.current) return;

    // Skip if already logged in today (optimistic check)
    if (hasLoggedInToday()) {
      dailyLoginAttempted.current = true;
      return;
    }

    dailyLoginAttempted.current = true;

    try {
      const result = await xpService.dailyLogin();
      setLastLoginResult(result);
      markLoggedInToday();

      // If XP was granted, refresh stats and daily tasks
      if (result.xpGranted > 0) {
        await fetchStats();
        await fetchDailyTasks();
      }
    } catch (err) {
      console.error('Failed to register daily login:', err);
    }
  }, [ready, authenticated, hasLoggedInToday, markLoggedInToday, fetchStats, fetchDailyTasks]);

  // Refetch all XP data
  const refetchAll = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchDailyTasks(),
      fetchWeeklyChallenges(),
      fetchDailyLimits(),
    ]);
  }, [fetchStats, fetchDailyTasks, fetchWeeklyChallenges, fetchDailyLimits]);

  // Initial load: fetch all data and attempt daily login
  useEffect(() => {
    if (ready && authenticated) {
      // Fetch all data in parallel
      Promise.all([
        fetchStats(),
        fetchDailyTasks(),
        fetchWeeklyChallenges(),
        fetchDailyLimits(),
      ]);
      handleDailyLogin();
    } else {
      // Reset state when logged out
      setStats(null);
      setLastLoginResult(null);
      setDailyTasks([]);
      setAllDailyTasksCompleted(false);
      setDailyBonusClaimed(false);
      setWeeklyChallenges([]);
      setWeekStart(null);
      setWeekEnd(null);
      setDailyLimits([]);
      dailyLoginAttempted.current = false;
    }
  }, [ready, authenticated, fetchStats, fetchDailyTasks, fetchWeeklyChallenges, fetchDailyLimits, handleDailyLogin]);

  // Update time until weekly reset every minute
  useEffect(() => {
    setTimeUntilWeeklyReset(formatTimeUntilReset(weekEnd));
    
    const interval = setInterval(() => {
      setTimeUntilWeeklyReset(formatTimeUntilReset(weekEnd));
    }, 60000);

    return () => clearInterval(interval);
  }, [weekEnd]);

  // Helper functions
  const hasReachedLimit = useCallback((actionType: string) => {
    const limit = dailyLimits.find(l => l.actionType === actionType);
    return limit ? limit.remaining === 0 : false;
  }, [dailyLimits]);

  const limitsReached = dailyLimits
    .filter(l => l.remaining === 0)
    .map(l => l.actionType);

  const dailyTasksCompletedCount = dailyTasks.filter(t => t.completed).length;

  // Refetch function for stats only
  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return (
    <XpContext.Provider value={{ 
      // Stats
      stats, 
      isLoading, 
      error, 
      lastLoginResult, 
      refetch,
      
      // Daily Tasks
      dailyTasks,
      allDailyTasksCompleted,
      dailyBonusXp,
      dailyBonusClaimed,
      dailyTasksCompletedCount,
      completeDailyTask,
      refetchDailyTasks: fetchDailyTasks,
      
      // Weekly Challenges
      weeklyChallenges,
      weekStart,
      weekEnd,
      timeUntilWeeklyReset,
      refetchWeeklyChallenges: fetchWeeklyChallenges,
      
      // Daily Limits
      dailyLimits,
      hasReachedLimit,
      limitsReached,
      refetchDailyLimits: fetchDailyLimits,
      
      // Refetch all
      refetchAll,
    }}>
      {children}
    </XpContext.Provider>
  );
}

export function useXpContext(): XpContextValue {
  const context = useContext(XpContext);
  if (!context) {
    throw new Error('useXpContext must be used within an XpProvider');
  }
  return context;
}

// Re-export for backward compatibility
export { XpContext };



