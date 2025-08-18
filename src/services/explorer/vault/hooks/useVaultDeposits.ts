import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchVaultDeposits } from '../api';
import { UseVaultDepositsResult, VaultDeposit } from '../types';
import { useVaults } from './useVaults';
import { useMemo } from 'react';

/**
 * Hook pour récupérer les dépôts de vault d'un utilisateur et calculer le total
 * @param address L'adresse de l'utilisateur
 * @returns Les dépôts, le total des dépôts, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export const useVaultDeposits = (address: string): UseVaultDepositsResult & { enrichedDeposits: (VaultDeposit & { name: string; apr: number | null; tvl: number | null })[] } => {
  const { 
    data: deposits,
    isLoading,
    error,
    refetch
  } = useDataFetching<VaultDeposit[]>({
    fetchFn: async () => {
      if (!address) {
        // Warning: No address provided for vault deposits
        return [];
      }
      try {
        const response = await fetchVaultDeposits({
          type: 'userVaultEquities',
          user: address
        });
        return response;
      } catch (err: unknown) {
        // Silent error handling
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vault deposits';
        throw new Error(errorMessage);
      }
    },
    refreshInterval: 60000, // Rafraîchir toutes les 60 secondes
    maxRetries: 3,
    dependencies: [address]
  });

  const { vaults, isLoading: vaultsLoading } = useVaults();

  // Jointure enrichie
  const enrichedDeposits = useMemo(() => {
    if (!deposits || !vaults) return [];
    return deposits.map(deposit => {
      const vault = vaults.find(v => v.summary.vaultAddress.toLowerCase() === deposit.vaultAddress.toLowerCase());
      return {
        ...deposit,
        name: vault?.summary.name || deposit.vaultAddress,
        apr: vault?.apr ?? null,
        tvl: vault ? parseFloat(vault.summary.tvl) : null,
      };
    });
  }, [deposits, vaults]);

  // Calculer le total des dépôts
  const totalEquity = deposits?.reduce((total, deposit) => {
    // Convertir la chaîne en nombre et l'ajouter au total
    return total + parseFloat(deposit.equity);
  }, 0) || 0;

  return {
    deposits: deposits || [],
    enrichedDeposits,
    totalEquity,
    isLoading: isLoading || vaultsLoading,
    error,
    refetch
  };
}; 