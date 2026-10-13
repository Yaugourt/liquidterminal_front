import { FeesStats, UseFeesStatsResult } from '../types';
import { getFeesStats } from '../api';
import { useDataFetching } from '../../../../hooks/useDataFetching'; // Assuming generic data fetching hook

/**
 * Custom hook to fetch and manage fees statistics.
 */
export function useFeesStats(): UseFeesStatsResult {
  const { 
    data: feesStats,
    isLoading,
    error,
    refetch,
   
  } = useDataFetching<FeesStats>({
    fetchFn: getFeesStats,
    // The backend's Hypurrscan poller runs every 30s.
    refreshInterval: 30000,
  });

  return {
    feesStats,
    isLoading,
    error,
    refetch,
  };
} 