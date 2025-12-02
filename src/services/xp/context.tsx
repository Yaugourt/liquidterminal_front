"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { xpService } from './api';
import { XpStats, DailyLoginData } from './types';

// Storage key for tracking daily login
const DAILY_LOGIN_KEY = 'xp_daily_login_date';

interface XpContextValue {
  stats: XpStats | null;
  isLoading: boolean;
  error: Error | null;
  lastLoginResult: DailyLoginData | null;
  refetch: () => Promise<void>;
}

const XpContext = createContext<XpContextValue | null>(null);

export function XpProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const [stats, setStats] = useState<XpStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastLoginResult, setLastLoginResult] = useState<DailyLoginData | null>(null);

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

      // If XP was granted, refresh stats
      if (result.xpGranted > 0) {
        await fetchStats();
      }
    } catch (err) {
      console.error('Failed to register daily login:', err);
    }
  }, [ready, authenticated, hasLoggedInToday, markLoggedInToday, fetchStats]);

  // Initial load: fetch stats and attempt daily login
  useEffect(() => {
    if (ready && authenticated) {
      fetchStats();
      handleDailyLogin();
    } else {
      // Reset state when logged out
      setStats(null);
      setLastLoginResult(null);
      dailyLoginAttempted.current = false;
    }
  }, [ready, authenticated, fetchStats, handleDailyLogin]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return (
    <XpContext.Provider value={{ stats, isLoading, error, lastLoginResult, refetch }}>
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



