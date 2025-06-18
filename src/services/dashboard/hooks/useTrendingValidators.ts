import { TrendingValidator } from '../types';
import { fetchTrendingValidators } from '../api';
import { useDataFetching } from '../../../hooks/useDataFetching';

export const useTrendingValidators = (
  sortBy: 'stake' | 'apr' = 'stake',
  initialData?: TrendingValidator[]
) => {
  const { data, isLoading, error, refetch } = useDataFetching<TrendingValidator[]>({
    fetchFn: () => fetchTrendingValidators(sortBy),
    initialData,
    refreshInterval: 30000 // 30 seconds
  });

  return {
    validators: data || [],
    isLoading,
    error,
    refetch
  };
}; 