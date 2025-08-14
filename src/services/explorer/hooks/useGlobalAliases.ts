import { GlobalAliasesData, UseGlobalAliasesResult, fetchGlobalAliases } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';

/**
 * Hook pour récupérer les alias globaux des adresses
 * Rafraîchit automatiquement toutes les 5 minutes
 */
export const useGlobalAliases = (): UseGlobalAliasesResult => {
  const { data, isLoading, error } = useDataFetching<GlobalAliasesData>({
    fetchFn: fetchGlobalAliases,
    dependencies: [],
    refreshInterval: 300000 // Rafraîchir toutes les 5 minutes (300000ms)
  });

  /**
   * Fonction utilitaire pour récupérer l'alias d'une adresse
   * @param address - L'adresse à rechercher
   * @returns L'alias s'il existe, sinon null
   */
  const getAlias = (address: string): string | null => {
    if (!data || !address) return null;
    
    // Normaliser l'adresse (lowercase)
    const normalizedAddress = address.toLowerCase();
    
    // Chercher l'alias exact
    return data[normalizedAddress] || null;
  };

  return {
    aliases: data,
    isLoading,
    error,
    getAlias
  };
};
