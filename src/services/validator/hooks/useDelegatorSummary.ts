import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchDelegatorSummary } from '../api';
import { UseDelegatorSummaryResult, DelegatorSummaryData } from '../types';

/**
 * Hook pour récupérer le résumé des délégations d'un utilisateur
 * @param address L'adresse de l'utilisateur
 * @returns Le résumé des délégations, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export const useDelegatorSummary = (address: string): UseDelegatorSummaryResult => {
  const { 
    data: summary,
    isLoading,
    error,
    refetch
  } = useDataFetching<DelegatorSummaryData | null>({
    fetchFn: async () => {
      if (!address) {
        console.warn('No address provided for delegator summary');
        return null;
      }

      try {
        const response = await fetchDelegatorSummary({
          type: 'delegatorSummary',
          user: address
        });

        // Vérifier que la réponse a une structure valide
        if (!response || typeof response !== 'object') {
          console.warn('Invalid response format for delegator summary:', response);
          return null;
        }

        return response;
      } catch (err: any) {
        console.error('Error fetching delegator summary:', err);
        throw new Error(err.message || 'Failed to fetch delegator summary');
      }
    },
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    maxRetries: 3,
    dependencies: [address]
  });

  return {
    summary,
    isLoading,
    error,
    refetch
  };
}; 