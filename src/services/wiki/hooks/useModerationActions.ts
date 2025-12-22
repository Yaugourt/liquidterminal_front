"use client";

import { useState, useCallback } from 'react';
import { approveResource, rejectResource } from '../api';
import { ApproveResourceInput, RejectResourceInput, EducationalResource } from '../types';

interface UseModerationActionsResult {
    approve: (resourceId: number, data?: ApproveResourceInput) => Promise<EducationalResource | null>;
    reject: (resourceId: number, data: RejectResourceInput) => Promise<EducationalResource | null>;
    isApproving: boolean;
    isRejecting: boolean;
    error: Error | null;
}

export function useModerationActions(): UseModerationActionsResult {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const approve = useCallback(async (resourceId: number, data?: ApproveResourceInput): Promise<EducationalResource | null> => {
        setIsApproving(true);
        setError(null);

        try {
            const response = await approveResource(resourceId, data);
            setIsApproving(false);
            return response.data;
        } catch (err) {
            setIsApproving(false);
            setError(err as Error);
            throw err;
        }
    }, []);

    const reject = useCallback(async (resourceId: number, data: RejectResourceInput): Promise<EducationalResource | null> => {
        setIsRejecting(true);
        setError(null);

        try {
            const response = await rejectResource(resourceId, data);
            setIsRejecting(false);
            return response.data;
        } catch (err) {
            setIsRejecting(false);
            setError(err as Error);
            throw err;
        }
    }, []);

    return {
        approve,
        reject,
        isApproving,
        isRejecting,
        error,
    };
}
