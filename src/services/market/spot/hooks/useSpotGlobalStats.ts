import { SpotGlobalStats } from '../types';
import { fetchSpotGlobalStats } from '../api';
import { useDataFetching } from '../../../../hooks/useDataFetching';

interface UseSpotGlobalStatsResult {
  stats: SpotGlobalStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useSpotGlobalStats = (): UseSpotGlobalStatsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<SpotGlobalStats>({
    fetchFn: fetchSpotGlobalStats
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch
  };
}; 