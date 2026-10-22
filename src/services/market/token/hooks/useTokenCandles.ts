import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTokenCandles } from '../api';
import { TokenCandle, CandleInterval } from '../types';

interface UseTokenCandlesParams {
  coin: string | null;
  interval?: CandleInterval;
  startTime?: number;
  endTime?: number;
  refreshInterval?: number;
}

const getIntervalInMs = (interval: string): number => {
  const value = parseInt(interval);
  const unit = interval.slice(-1);

  switch (unit) {
    case 's': return value * 1000;
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

  // One window per mount and per interval, start and end from the same "now".
  // The end used to be fixed at mount only, so switching interval on a tab
  // left open paired a fresh start with an old end: an inverted window (an
  // empty chart, and a 400 from the backend's candle route, which checks it).
  const { calculatedStartTime, fixedEndTime } = useMemo(() => {
    const now = Date.now();
    const end = endTime || now;
    if (startTime) return { calculatedStartTime: startTime, fixedEndTime: end };
    const intervalMs = getIntervalInMs(interval);
    // Load 1000 candles by default for good history. Not before 1970: 1,000
    // months is, and HL answers a negative startTime with a 422.
    return { calculatedStartTime: Math.max(0, now - (1000 * intervalMs)), fixedEndTime: end };
  }, [startTime, endTime, interval]);

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
