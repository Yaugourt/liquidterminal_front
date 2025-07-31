import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchDelegatorRewards } from '../../delegator';
import { UseDelegatorRewardsResult, FormattedDelegatorRewardItem } from '../../types/delegator';

/**
 * Hook pour récupérer les récompenses des délégations d'un utilisateur
 * @param address L'adresse de l'utilisateur
 * @returns Les récompenses des délégations, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export const useDelegatorRewards = (address: string): UseDelegatorRewardsResult => {
  const { 
    data: rewardsData,
    isLoading,
    error,
    refetch
  } = useDataFetching<FormattedDelegatorRewardItem[]>({
    fetchFn: async () => {
      if (!address) {
        console.warn('No address provided for delegator rewards');
        return [];
      }

      try {
        const response = await fetchDelegatorRewards({
          type: 'delegatorRewards',
          user: address
        });

        // Vérifier que la réponse est un tableau
        if (!Array.isArray(response)) {
          console.warn('Invalid response format for delegator rewards:', response);
          return [];
        }

        // Formater les données pour l'affichage
        return response
          .filter(item => {
            // Vérifier que l'item a une structure valide
            return item && 
                   typeof item.time === 'number' &&
                   typeof item.source === 'string' &&
                   typeof item.totalAmount === 'string';
          })
          .map(item => ({
            time: new Date(item.time).toLocaleString(),
            timestamp: item.time,
            source: item.source,
            amount: parseFloat(item.totalAmount)
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // Trier par timestamp décroissant
      } catch (err: unknown) {
        // Silent error handling
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch delegator rewards';
        throw new Error(errorMessage);
      }
    },
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    maxRetries: 3,
    dependencies: [address]
  });

  return {
    rewards: rewardsData || [],
    isLoading,
    error,
    refetch
  };
}; 