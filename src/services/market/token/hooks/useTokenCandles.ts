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

export const useTokenCandles = ({
  coin,
  interval = "1d", // Changed default to 15m
  startTime = 1713225600000, // 16 avril 2024
  endTime, // Remove default Date.now() to avoid constant changes
  refreshInterval = 60000 // Default 1 minute refresh
}: UseTokenCandlesParams) => {
  // Set endTime only once using useMemo to avoid constant changes
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
      
      const result = await fetchTokenCandles(coin, interval, startTime, fixedEndTime);
      return result;
    },
    refreshInterval,
    dependencies: [coin, interval, startTime, fixedEndTime],
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
