import { fetchAllValidators } from '../../validators';
import { UseValidatorsResult, Validator, ValidatorStats } from '../../types/validators';
import { useDataFetching } from '../../../../hooks/useDataFetching';

export const useValidators = (initialData?: Validator[]): UseValidatorsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<{ validators: Validator[], stats: ValidatorStats }>({
    fetchFn: fetchAllValidators,
    refreshInterval: 30000 // 30 seconds
  });

  const validators = data?.validators || initialData || [];
  const stats = data?.stats || {
    total: 0,
    active: 0,
    inactive: 0,
    totalHypeStaked: 0
  };

  return {
    validators,
    stats,
    isLoading,
    error,
    refetch
  };
}; 