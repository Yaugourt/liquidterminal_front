/**
 * Hook pour récupérer les balances de tokens Hyperliquid
 */

import { useState, useEffect, useCallback } from "react";
import { fetchHyperliquidBalances } from "../api";
import { HyperliquidBalance, HyperliquidBalancesRequest, UseHyperliquidBalancesResult } from "../types";

/**
 * Hook pour récupérer les balances de tokens d'un utilisateur depuis Hyperliquid
 * @param userAddress Adresse de l'utilisateur
 * @returns Les balances de tokens, l'état de chargement, les erreurs et une fonction de rafraîchissement
 */
export function useHyperliquidBalances(userAddress: string | undefined): UseHyperliquidBalancesResult {
  const [balances, setBalances] = useState<HyperliquidBalance[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!userAddress) {
      console.log("useHyperliquidBalances: Pas d'adresse de wallet fournie");
      setBalances(null);
      return;
    }

    console.log("useHyperliquidBalances: Récupération des balances pour l'adresse:", userAddress);
    setIsLoading(true);
    setError(null);

    try {
      const request: HyperliquidBalancesRequest = {
        type: "spotClearinghouseState",
        user: userAddress
      };
      
      const response = await fetchHyperliquidBalances(request);

      console.log("useHyperliquidBalances: Réponse reçue:", response);
      setBalances(response);
    } catch (err) {
      console.error("useHyperliquidBalances: Erreur lors de la récupération des balances:", err);
      setError(err instanceof Error ? err : new Error("Erreur inconnue"));
      setBalances(null);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  // Récupérer les balances au chargement et lorsque l'adresse change
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances,
  };
} 