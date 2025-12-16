"use client";

import { useState, useCallback } from 'react';
import { submitResource, SubmitResourceResult } from '../api';
import { CreateResourceInput, EducationalResource } from '../types';
import { AxiosError } from 'axios';

interface SubmitResourceState {
    isLoading: boolean;
    error: Error | null;
    rateLimitRemaining: number | undefined;
    rateLimitLimit: number | undefined;
    isRateLimited: boolean;
}

interface UseSubmitResourceResult extends SubmitResourceState {
    submit: (data: CreateResourceInput) => Promise<EducationalResource | null>;
    reset: () => void;
}

export function useSubmitResource(): UseSubmitResourceResult {
    const [state, setState] = useState<SubmitResourceState>({
        isLoading: false,
        error: null,
        rateLimitRemaining: undefined,
        rateLimitLimit: undefined,
        isRateLimited: false,
    });

    const submit = useCallback(async (data: CreateResourceInput): Promise<EducationalResource | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const result: SubmitResourceResult = await submitResource(data);

            setState(prev => ({
                ...prev,
                isLoading: false,
                rateLimitRemaining: result.rateLimitRemaining,
                rateLimitLimit: result.rateLimitLimit,
                isRateLimited: result.rateLimitRemaining === 0,
            }));

            return result.response.data;
        } catch (err) {
            const error = err as AxiosError<{ code?: string }>;
            const isRateLimited = error.response?.status === 429 ||
                error.response?.data?.code === 'RATE_LIMIT_EXCEEDED';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: err as Error,
                isRateLimited,
                rateLimitRemaining: isRateLimited ? 0 : prev.rateLimitRemaining,
            }));

            throw err;
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            error: null,
            rateLimitRemaining: undefined,
            rateLimitLimit: undefined,
            isRateLimited: false,
        });
    }, []);

    return {
        ...state,
        submit,
        reset,
    };
}
