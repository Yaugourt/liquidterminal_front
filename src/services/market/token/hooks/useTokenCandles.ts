import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTokenCandles } from '../api';
import { TokenCandle } from '../types';

interface UseTokenCandlesParams {
  coin: string | null;
  interval?: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
  startTime?: number;
  endTime?: number;
  refreshInterval?: number;
}

const getIntervalInMs = (interval: string): number => {
  const value = parseInt(interval);
  const unit = interval.slice(-1);

  switch (unit) {
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    case 'M': return value * 30 * 24 * 60 * 60 * 1000; // Approx
    default: return 24 * 60 * 60 * 1000; // Default 1d
  }
};

export const useTokenCandles = ({
  coin,
  interval = "1d",
  startTime,
  endTime,
  refreshInterval = 0
}: UseTokenCandlesParams) => {

  // Calculate dynamic start time if not provided (default to ~1000 candles back or appropriate history)
  const calculatedStartTime = useMemo(() => {
    if (startTime) return startTime;
    const now = Date.now();
    const intervalMs = getIntervalInMs(interval);
    // Load 1000 candles by default for good history
    return now - (1000 * intervalMs);
  }, [startTime, interval]);

  // Set endTime only once using useMemo or update when it changes effectively
  const fixedEndTime = useMemo(() => endTime || Date.now(), [endTime]);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useDataFetching<TokenCandle[]>({
    fetchFn: async () => {
      if (!coin) {
        return [];
      }

      const result = await fetchTokenCandles(coin, interval, calculatedStartTime, fixedEndTime);
      return result;
    },
    refreshInterval,
    dependencies: [coin, interval, calculatedStartTime, fixedEndTime],
    maxRetries: 3,
    retryDelay: 1000
  });

  return {
    candles: data || [],
    isLoading,
    error: error?.message || null,
    refetch
  };
};
