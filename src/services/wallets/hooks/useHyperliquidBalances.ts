/**
 * Hook pour récupérer les balances de tokens Hyperliquid
 */

import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHyperliquidBalances } from "../api";
import { HyperliquidBalance, HyperliquidBalancesRequest, UseHyperliquidBalancesResult } from "../types";

/**
 * Hook pour récupérer les balances de tokens d'un utilisateur depuis Hyperliquid
 * @param userAddress Adresse de l'utilisateur
 * @returns Les balances de tokens, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export function useHyperliquidBalances(userAddress: string | undefined): UseHyperliquidBalancesResult {
  const { 
    data: balances,
    isLoading,
    error,
    refetch
  } = useDataFetching<HyperliquidBalance[] | null>({
    fetchFn: async () => {
      if (!userAddress) {
  
        return null;
      }

  
      
      const request: HyperliquidBalancesRequest = {
        type: "spotClearinghouseState",
        user: userAddress
      };
      
      const response = await fetchHyperliquidBalances(request);

      
      return response;
    },
    refreshInterval: 20000, // Rafraîchir toutes les 10 secondes
    maxRetries: 3,
    dependencies: [userAddress]
  });

  return {
    balances,
    isLoading,
    error,
    refetch
  };
} 