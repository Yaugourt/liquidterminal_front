import { fetchAllValidators } from '../api';
import { UseValidatorsResult, Validator, ValidatorStats } from '../types';
import { useDataFetching } from '../../../hooks/useDataFetching';
import { useMemo } from 'react';

export const useValidators = (initialData?: Validator[]): UseValidatorsResult => {
  const { data, isLoading, error, refetch } = useDataFetching<Validator[]>({
    fetchFn: fetchAllValidators,
    initialData,
    refreshInterval: 30000 // 30 seconds
  });

  const validators = data || [];

  // Calculate validator statistics
  const stats: ValidatorStats = useMemo(() => {
    const total = validators.length;
    const active = validators.filter(validator => validator.isActive).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [validators]);

  return {
    validators,
    stats,
    isLoading,
    error,
    refetch
  };
}; 