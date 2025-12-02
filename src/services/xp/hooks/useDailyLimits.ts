import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { xpService } from '../api';
import { DailyLimit, LimitedActionType } from '../types';

interface UseDailyLimitsReturn {
  limits: DailyLimit[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getLimit: (actionType: LimitedActionType) => DailyLimit | undefined;
  hasReachedLimit: (actionType: LimitedActionType) => boolean;
  limitsReached: LimitedActionType[];
}

export function useDailyLimits(): UseDailyLimitsReturn {
  const { ready, authenticated } = usePrivy();
  const [limits, setLimits] = useState<DailyLimit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDailyLimits = useCallback(async () => {
    if (!ready || !authenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await xpService.getDailyLimits();
      setLimits(data.limits);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch daily limits:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ready, authenticated]);

  // Initial load
  useEffect(() => {
    if (ready && authenticated) {
      fetchDailyLimits();
    } else {
      setLimits([]);
    }
  }, [ready, authenticated, fetchDailyLimits]);

  const getLimit = useCallback((actionType: LimitedActionType) => {
    return limits.find(l => l.actionType === actionType);
  }, [limits]);

  const hasReachedLimit = useCallback((actionType: LimitedActionType) => {
    const limit = getLimit(actionType);
    return limit ? limit.remaining === 0 : false;
  }, [getLimit]);

  const limitsReached = useMemo(() => 
    limits.filter(l => l.remaining === 0).map(l => l.actionType),
    [limits]
  );

  return {
    limits,
    isLoading,
    error,
    refetch: fetchDailyLimits,
    getLimit,
    hasReachedLimit,
    limitsReached,
  };
}

