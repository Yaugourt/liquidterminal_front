import { FormattedStakingValidation, UseStakingValidationsResult, fetchStakingValidations } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';

/**
 * Hook pour récupérer et formater les validations de staking
 */
export const useStakingValidations = (): UseStakingValidationsResult => {
  const { data, isLoading, error } = useDataFetching<FormattedStakingValidation[]>({
    fetchFn: async () => {
      const validations = await fetchStakingValidations();
      
      // Trier par timestamp décroissant (plus récent en premier)
      return validations.sort((a, b) => b.timestamp - a.timestamp);
    },
    dependencies: [],
    refreshInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  return {
    validations: data,
    isLoading,
    error
  };
}; 