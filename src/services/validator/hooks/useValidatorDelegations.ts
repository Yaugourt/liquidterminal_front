import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchValidatorDelegations } from '../api';
import { UseValidatorDelegationsResult, ValidatorDelegation } from '../types';

/**
 * Hook pour récupérer les délégations de staking d'un utilisateur et calculer le total
 * @param address L'adresse de l'utilisateur
 * @returns Les délégations, le total staké, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export const useValidatorDelegations = (address: string): UseValidatorDelegationsResult => {
  const { 
    data: delegations,
    isLoading,
    error,
    refetch
  } = useDataFetching<ValidatorDelegation[]>({
    fetchFn: async () => {
      if (!address) {
        console.warn('No address provided for validator delegations');
        return [];
      }

      console.log('Fetching validator delegations for address:', address);

      try {
        const response = await fetchValidatorDelegations({
          type: 'delegations',
          user: address
        });

        console.log('Received validator delegations:', response);
        return response;
      } catch (err: any) {
        console.error('Error fetching validator delegations:', err);
        throw new Error(err.message || 'Failed to fetch validator delegations');
      }
    },
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    maxRetries: 3,
    dependencies: [address]
  });

  // Calculer le total staké
  const totalStaked = delegations?.reduce((total, delegation) => {
    // Convertir la chaîne en nombre et l'ajouter au total
    return total + parseFloat(delegation.amount);
  }, 0) || 0;

  return {
    delegations: delegations || [],
    totalStaked,
    isLoading,
    error,
    refetch
  };
}; 