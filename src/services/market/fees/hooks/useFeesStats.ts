import { FeesStats, UseFeesStatsResult } from '../types';
import { fetchFeesStats } from '../api';
import { useDataFetching } from '../../../../hooks/useDataFetching'; // Assuming generic data fetching hook

/**
 * Custom hook to fetch and manage fees statistics.
 */
export function useFeesStats(): UseFeesStatsResult {
  const { 
    data: feesStats,
    isLoading,
    error,
    refetch
  } = useDataFetching<FeesStats>({
    fetchFn: fetchFeesStats,
    // Consider adding a pollInterval if fees should update periodically, e.g., pollInterval: 60000 (for 1 minute)
  });

  return {
    feesStats,
    isLoading,
    error,
    refetch,
  };
} 