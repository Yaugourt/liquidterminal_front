import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { usePrivy } from '@/services/auth/privy';
import { xpService } from '../api';
import { XpStats, XpTransaction, DailyLoginData } from '../types';
import { XpContext } from '../context';

// Storage key for tracking daily login (one per user id: several accounts can
// share a browser)
const DAILY_LOGIN_KEY = 'xp_daily_login_date';

interface UseXpReturn {
    stats: XpStats | null;
    history: XpTransaction[];
    isLoading: boolean;
    isLoadingHistory: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    refetchHistory: (page?: number) => Promise<void>;
    lastLoginResult: DailyLoginData | null;
    historyPagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    } | null;
}

export function useXp(): UseXpReturn {
    // Try to use context if available
    const context = useContext(XpContext);
    
    const { ready, authenticated, user } = usePrivy();
    const userId = user?.id;
    const [localStats, setLocalStats] = useState<XpStats | null>(null);
    const [history, setHistory] = useState<XpTransaction[]>([]);
    const [historyPagination, setHistoryPagination] = useState<UseXpReturn['historyPagination']>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastLoginResult, setLastLoginResult] = useState<DailyLoginData | null>(null);

    // User id the daily login was attempted for this session
    const dailyLoginAttempted = useRef<string | null>(null);

    // Check if we already logged in today (local storage)
    const hasLoggedInToday = useCallback((id: string): boolean => {
        if (typeof window === 'undefined') return true;
        const lastLogin = localStorage.getItem(`${DAILY_LOGIN_KEY}:${id}`);
        if (!lastLogin) return false;

        const today = new Date().toDateString();
        return lastLogin === today;
    }, []);

    // Mark today as logged in
    const markLoggedInToday = useCallback((id: string) => {
        if (typeof window === 'undefined') return;
        const today = new Date().toDateString();
        localStorage.setItem(`${DAILY_LOGIN_KEY}:${id}`, today);
    }, []);

    // Fetch XP stats (only if no context)
    const fetchStats = useCallback(async () => {
        if (!ready || !authenticated) return;
        if (context) return; // Use context instead

        try {
            setIsLoading(true);
            setError(null);
            const data = await xpService.getStats();
            setLocalStats(data);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to fetch XP stats:', err);
        } finally {
            setIsLoading(false);
        }
    }, [ready, authenticated, context]);

    // Fetch XP history
    const fetchHistory = useCallback(async (page = 1) => {
        if (!ready || !authenticated) return;

        try {
            setIsLoadingHistory(true);
            const data = await xpService.getHistory({ page, limit: 20 });
            setHistory(data.transactions);
            setHistoryPagination(data.pagination);
        } catch (err) {
            console.error('Failed to fetch XP history:', err);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [ready, authenticated]);

    // Handle daily login (only if no context)
    const handleDailyLogin = useCallback(async () => {
        if (!ready || !authenticated || !userId || dailyLoginAttempted.current === userId) return;
        if (context) return; // Context handles this

        // Skip if already logged in today (optimistic check)
        if (hasLoggedInToday(userId)) {
            dailyLoginAttempted.current = userId;
            return;
        }

        dailyLoginAttempted.current = userId;

        try {
            const result = await xpService.dailyLogin();
            setLastLoginResult(result);
            markLoggedInToday(userId);

            // If XP was granted, refresh stats
            if (result.xpGranted > 0) {
                await fetchStats();
            }
        } catch (err) {
            console.error('Failed to register daily login:', err);
        }
    }, [ready, authenticated, userId, hasLoggedInToday, markLoggedInToday, fetchStats, context]);

    // Initial load: fetch stats and attempt daily login (only if no context)
    useEffect(() => {
        if (context) return; // Context handles initialization
        
        if (ready && authenticated) {
            fetchStats();
            handleDailyLogin();
        } else {
            // Reset state when logged out
            setLocalStats(null);
            setHistory([]);
            setHistoryPagination(null);
            setLastLoginResult(null);
            dailyLoginAttempted.current = null;
        }
    }, [ready, authenticated, fetchStats, handleDailyLogin, context]);

    // Refetch function
    const refetch = useCallback(async () => {
        if (context) {
            await context.refetch();
        } else {
            await fetchStats();
        }
    }, [fetchStats, context]);

    // If context is available, use its values
    if (context) {
        return {
            stats: context.stats,
            history,
            isLoading: context.isLoading,
            isLoadingHistory,
            error: context.error,
            refetch,
            refetchHistory: fetchHistory,
            lastLoginResult: context.lastLoginResult,
            historyPagination,
        };
    }

    return {
        stats: localStats,
        history,
        isLoading,
        isLoadingHistory,
        error,
        refetch,
        refetchHistory: fetchHistory,
        lastLoginResult,
        historyPagination,
    };
}
