import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchValidatorDelegations } from '../../validators';
import { UseValidatorDelegationsResult, ValidatorDelegation } from '../../types/validators';
import { useValidators } from './useValidators';
import { useMemo, useCallback } from 'react';

/**
 * Hook pour récupérer les délégations de staking d'un utilisateur et calculer le total
 * @param address L'adresse de l'utilisateur
 * @returns Les délégations, le total staké, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export const useValidatorDelegations = (address: string): UseValidatorDelegationsResult => {
  const { 
    data: delegations,
    isLoading: delegationsLoading,
    error: delegationsError,
    refetch
  } = useDataFetching<ValidatorDelegation[]>({
    fetchFn: async () => {
      if (!address) {
        // Warning: No address provided for validator delegations
        return [];
      }

      try {
        const response = await fetchValidatorDelegations({
          type: 'delegations',
          user: address
        });

        return response;
      } catch (err: unknown) {
        // Silent error handling
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch validator delegations';
        throw new Error(errorMessage);
      }
    },
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    maxRetries: 3,
    dependencies: [address]
  });

  // Hook pour récupérer les informations des validators
  const { 
    validators, 
    isLoading: validatorsLoading, 
    error: validatorsError 
  } = useValidators();

  // Fonction pour obtenir le nom du validator à partir de son adresse
  const getValidatorName = useCallback((validatorAddress: string) => {
    const validator = validators.find(v => 
      v.validator?.toLowerCase() === validatorAddress.toLowerCase()
    );
    return validator?.name || `${validatorAddress.slice(0, 8)}...${validatorAddress.slice(-6)}`;
  }, [validators]);

  // Enrichir les délégations avec les noms des validators
  const enrichedDelegations = useMemo(() => {
    if (!delegations) return [];
    
    return delegations.map(delegation => ({
      ...delegation,
      validatorName: getValidatorName(delegation.validator)
    }));
  }, [delegations, getValidatorName]);

  // Calculer le total staké
  const totalStaked = delegations?.reduce((total, delegation) => {
    // Convertir la chaîne en nombre et l'ajouter au total
    return total + parseFloat(delegation.amount);
  }, 0) || 0;

  // États de chargement et d'erreur combinés
  const isLoading = delegationsLoading || validatorsLoading;
  const error = delegationsError || validatorsError;

  return {
    delegations: enrichedDelegations,
    totalStaked,
    isLoading,
    error,
    refetch
  };
}; 