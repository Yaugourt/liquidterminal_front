"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchPendingCount } from '../api';

interface UsePendingCountResult {
    count: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function usePendingCount(pollInterval?: number): UsePendingCountResult {
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const response = await fetchPendingCount();
            setCount(response.data.count);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Optional polling for real-time badge updates
        if (pollInterval && pollInterval > 0) {
            const interval = setInterval(fetchData, pollInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, pollInterval]);

    return {
        count,
        isLoading,
        error,
        refetch: fetchData,
    };
}
