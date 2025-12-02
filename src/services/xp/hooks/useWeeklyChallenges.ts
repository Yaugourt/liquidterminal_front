import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { xpService } from '../api';
import { WeeklyChallenge } from '../types';

interface UseWeeklyChallengesReturn {
  challenges: WeeklyChallenge[];
  weekStart: string | null;
  weekEnd: string | null;
  timeUntilReset: string;
  completedCount: number;
  totalXpAvailable: number;
  totalXpEarned: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function formatTimeUntilReset(weekEnd: string | null): string {
  if (!weekEnd) return '';
  
  const end = new Date(weekEnd);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Resetting...';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  return `${hours}h`;
}

export function useWeeklyChallenges(): UseWeeklyChallengesReturn {
  const { ready, authenticated } = usePrivy();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [weekEnd, setWeekEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  const fetchWeeklyChallenges = useCallback(async () => {
    if (!ready || !authenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await xpService.getWeeklyChallenges();
      setChallenges(data.challenges);
      setWeekStart(data.weekStart);
      setWeekEnd(data.weekEnd);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch weekly challenges:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ready, authenticated]);

  // Initial load
  useEffect(() => {
    if (ready && authenticated) {
      fetchWeeklyChallenges();
    } else {
      setChallenges([]);
      setWeekStart(null);
      setWeekEnd(null);
    }
  }, [ready, authenticated, fetchWeeklyChallenges]);

  // Update time until reset every minute
  useEffect(() => {
    setTimeUntilReset(formatTimeUntilReset(weekEnd));
    
    const interval = setInterval(() => {
      setTimeUntilReset(formatTimeUntilReset(weekEnd));
    }, 60000);

    return () => clearInterval(interval);
  }, [weekEnd]);

  const completedCount = challenges.filter(c => c.completed).length;
  
  const totalXpAvailable = useMemo(() => 
    challenges.reduce((sum, c) => sum + c.xpReward, 0),
    [challenges]
  );
  
  const totalXpEarned = useMemo(() => 
    challenges.filter(c => c.completed).reduce((sum, c) => sum + c.xpReward, 0),
    [challenges]
  );

  return {
    challenges,
    weekStart,
    weekEnd,
    timeUntilReset,
    completedCount,
    totalXpAvailable,
    totalXpEarned,
    isLoading,
    error,
    refetch: fetchWeeklyChallenges,
  };
}

