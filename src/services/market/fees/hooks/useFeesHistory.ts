import { FeesHistoryEntry, UseFeesHistoryResult } from '../types';
import { getFeesHistory } from '../api';
import { useDataFetching } from '../../../../hooks/useDataFetching';

/**
 * Custom hook to fetch and manage fees history.
 */
export function useFeesHistory(): UseFeesHistoryResult {
  const { 
    data: feesHistory,
    isLoading,
    error,
    refetch,
  } = useDataFetching<FeesHistoryEntry[]>({
    fetchFn: getFeesHistory,
    refreshInterval: 300000, // 5 minutes - historique moins fréquent que les stats
    maxRetries: 3,
  });

  return {
    feesHistory,
    isLoading,
    error,
    refetch,
  };
} 