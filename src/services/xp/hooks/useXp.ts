import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { xpService } from '../api';
import { XpStats, XpTransaction, DailyLoginData } from '../types';
import { XpContext } from '../context';

// Storage key for tracking daily login
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
    
    const { ready, authenticated } = usePrivy();
    const [localStats, setLocalStats] = useState<XpStats | null>(null);
    const [history, setHistory] = useState<XpTransaction[]>([]);
    const [historyPagination, setHistoryPagination] = useState<UseXpReturn['historyPagination']>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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
        if (!ready || !authenticated || dailyLoginAttempted.current) return;
        if (context) return; // Context handles this

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
    }, [ready, authenticated, hasLoggedInToday, markLoggedInToday, fetchStats, context]);

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
            dailyLoginAttempted.current = false;
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
