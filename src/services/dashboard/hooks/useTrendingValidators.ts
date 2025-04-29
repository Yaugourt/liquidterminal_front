import { TrendingValidator, UseTrendingValidatorsResult } from '../types';
import { fetchTrendingValidators } from '../api';
import { useDataFetching } from '../../../hooks/useDataFetching';

export const useTrendingValidators = (sortBy: 'stake' | 'apr' = 'stake'): UseTrendingValidatorsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<TrendingValidator[]>({
    fetchFn: () => fetchTrendingValidators(sortBy),
    dependencies: [sortBy]
  });

  return {
    validators: data || [],
    isLoading,
    error,
    refetch
  };
}; 