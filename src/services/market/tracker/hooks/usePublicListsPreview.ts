import { useDataFetching } from '@/hooks/useDataFetching';
import { getPublicWalletLists } from '../walletlist.service';
import {  WalletListResponse } from '../types';

/**
 * Hook pour récupérer un aperçu des listes publiques
 * Utilisé pour afficher un preview sur la home page du tracker
 * @param limit - Nombre de listes à récupérer (défaut: 6)
 * @returns Liste des listes publiques avec état de chargement
 */
export const usePublicListsPreview = (limit: number = 6) => {
  const { data, isLoading, error, refetch } = useDataFetching<WalletListResponse>({
    fetchFn: () => getPublicWalletLists({
      limit,
      page: 1
    }),
    refreshInterval: 60000, // 60s - mise à jour modérée pour preview
    maxRetries: 3,
    dependencies: [limit],
  });

  return {
    lists: data?.data || [],
    total: data?.pagination?.total || 0,
    isLoading,
    error,
    refetch
  };
};
