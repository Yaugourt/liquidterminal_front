"use client";

import { useState, useCallback } from 'react';
import { reportResource } from '../api';
import { ReportResourceInput, ResourceReport } from '../types';
import { AxiosError } from 'axios';

interface UseReportResourceResult {
    report: (resourceId: number, data: ReportResourceInput) => Promise<ResourceReport | null>;
    isLoading: boolean;
    error: Error | null;
    isDuplicateReport: boolean;
    reset: () => void;
}

export function useReportResource(): UseReportResourceResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isDuplicateReport, setIsDuplicateReport] = useState(false);

    const report = useCallback(async (resourceId: number, data: ReportResourceInput): Promise<ResourceReport | null> => {
        setIsLoading(true);
        setError(null);
        setIsDuplicateReport(false);

        try {
            const response = await reportResource(resourceId, data);
            setIsLoading(false);
            return response.data;
        } catch (err) {
            const axiosError = err as AxiosError<{ code?: string }>;
            const isDuplicate = axiosError.response?.data?.code === 'DUPLICATE_REPORT' ||
                axiosError.response?.status === 409;

            setIsLoading(false);
            setError(err as Error);
            setIsDuplicateReport(isDuplicate);
            throw err;
        }
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setIsDuplicateReport(false);
    }, []);

    return {
        report,
        isLoading,
        error,
        isDuplicateReport,
        reset,
    };
}
