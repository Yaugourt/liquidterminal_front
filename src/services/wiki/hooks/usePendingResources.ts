"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchPendingResources } from '../api';
import { EducationalResource } from '../types';

interface UsePendingResourcesResult {
    resources: EducationalResource[];
    isLoading: boolean;
    error: Error | null;
    pagination: {
        page: number;
        totalPages: number;
        total: number;
    };
    setPage: (page: number) => void;
    refetch: () => Promise<void>;
}

export function usePendingResources(limit = 20): UsePendingResourcesResult {
    const [resources, setResources] = useState<EducationalResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetchPendingResources(page, limit);
            setResources(response.data || []);
            setPagination({
                page: response.pagination.page,
                totalPages: response.pagination.totalPages,
                total: response.pagination.total,
            });
        } catch (err) {
            setError(err as Error);
            setResources([]);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        resources,
        isLoading,
        error,
        pagination,
        setPage,
        refetch: fetchData,
    };
}
