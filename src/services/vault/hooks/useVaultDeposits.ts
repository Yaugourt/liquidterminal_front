import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchVaultDeposits } from '../api';
import { UseVaultDepositsResult, VaultDeposit } from '../types';

/**
 * Hook pour récupérer les dépôts de vault d'un utilisateur et calculer le total
 * @param address L'adresse de l'utilisateur
 * @returns Les dépôts, le total des dépôts, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export const useVaultDeposits = (address: string): UseVaultDepositsResult => {
  const { 
    data: deposits,
    isLoading,
    error,
    refetch
  } = useDataFetching<VaultDeposit[]>({
    fetchFn: async () => {
      if (!address) {
        console.warn('No address provided for vault deposits');
        return [];
      }



      try {
        const response = await fetchVaultDeposits({
          type: 'userVaultEquities',
          user: address
        });

  
        return response;
      } catch (err: any) {
        console.error('Error fetching vault deposits:', err);
        throw new Error(err.message || 'Failed to fetch vault deposits');
      }
    },
    refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    maxRetries: 3,
    dependencies: [address]
  });

  // Calculer le total des dépôts
  const totalEquity = deposits?.reduce((total, deposit) => {
    // Convertir la chaîne en nombre et l'ajouter au total
    return total + parseFloat(deposit.equity);
  }, 0) || 0;

  return {
    deposits: deposits || [],
    totalEquity,
    isLoading,
    error,
    refetch
  };
}; 