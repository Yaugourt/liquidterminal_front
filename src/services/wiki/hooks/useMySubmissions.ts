"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchMySubmissions } from '../api';
import { EducationalResource } from '../types';

interface UseMySubmissionsResult {
    submissions: EducationalResource[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useMySubmissions(): UseMySubmissionsResult {
    const [submissions, setSubmissions] = useState<EducationalResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetchMySubmissions();
            setSubmissions(response.data || []);
        } catch (err) {
            setError(err as Error);
            setSubmissions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        submissions,
        isLoading,
        error,
        refetch: fetchData,
    };
}
