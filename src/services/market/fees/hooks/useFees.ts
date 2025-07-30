// DEPRECATED: This file is deprecated. Use useFeesStats.ts instead.
// This file is kept for backward compatibility but should not be used.

import { FeesStats, UseFeesStatsResult } from '../types';
import { getFeesStats } from '../api';
import { useDataFetching } from '../../../../hooks/useDataFetching';

/**
 * @deprecated Use useFeesStats from './useFeesStats' instead
 */
export function useFeesStats(): UseFeesStatsResult {
  const { 
    data: feesStats,
    isLoading,
    error,
    refetch,
  } = useDataFetching<FeesStats>({
    fetchFn: getFeesStats,
    refreshInterval: 60000,
  });

  return {
    feesStats,
    isLoading,
    error,
    refetch,
  };
}