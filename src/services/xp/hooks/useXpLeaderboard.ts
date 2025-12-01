import { useState, useEffect, useCallback } from 'react';
import { xpService, LeaderboardParams } from '../api';
import { LeaderboardEntry } from '../types';

interface UseXpLeaderboardReturn {
    leaderboard: LeaderboardEntry[];
    userRank: number | null;
    total: number;
    isLoading: boolean;
    error: Error | null;
    refetch: (params?: LeaderboardParams) => Promise<void>;
    loadMore: () => Promise<void>;
    hasMore: boolean;
    currentPage: number;
}

export function useXpLeaderboard(initialLimit = 20): UseXpLeaderboardReturn {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(initialLimit);

    const fetchLeaderboard = useCallback(async (params?: LeaderboardParams, append = false) => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await xpService.getLeaderboard({
                page: params?.page || 1,
                limit: params?.limit || limit,
            });

            if (append) {
                setLeaderboard(prev => [...prev, ...data.leaderboard]);
            } else {
                setLeaderboard(data.leaderboard);
            }

            if (data.userRank !== undefined) {
                setUserRank(data.userRank);
            }
            setTotal(data.total);
            setCurrentPage(params?.page || 1);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    // Initial load
    useEffect(() => {
        fetchLeaderboard({ page: 1, limit });
    }, [fetchLeaderboard, limit]);

    const refetch = useCallback(async (params?: LeaderboardParams) => {
        await fetchLeaderboard(params || { page: 1, limit });
    }, [fetchLeaderboard, limit]);

    const loadMore = useCallback(async () => {
        const nextPage = currentPage + 1;
        await fetchLeaderboard({ page: nextPage, limit }, true);
    }, [currentPage, fetchLeaderboard, limit]);

    const hasMore = leaderboard.length < total;

    return {
        leaderboard,
        userRank,
        total,
        isLoading,
        error,
        refetch,
        loadMore,
        hasMore,
        currentPage,
    };
}

