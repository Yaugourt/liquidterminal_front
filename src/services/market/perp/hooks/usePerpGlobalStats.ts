import { PerpGlobalStats } from '../types';
import { fetchPerpGlobalStats } from '../api';
import { useDataFetching } from '../../../../hooks/useDataFetching';

interface UsePerpGlobalStatsResult {
  stats: PerpGlobalStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const usePerpGlobalStats = (): UsePerpGlobalStatsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<PerpGlobalStats>({
    fetchFn: fetchPerpGlobalStats,
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch
  };
}; 