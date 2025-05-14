import { useMemo } from "react";
import { useWalletsBalances } from "@/services/wallets/hooks/useWalletsBalances";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";

export function useAddressBalance(address: string) {
  const { spotBalances, perpPositions, isLoading, error, refresh } = useWalletsBalances(address);
  const { 
    data: spotMarketTokens, 
    isLoading: isSpotMarketLoading, 
    refetch: refetchSpotMarket 
  } = useSpotTokens({ limit: 100 });

  // Calculer les statistiques du portefeuille
  const balances = useMemo(() => {
    if (!spotBalances || !perpPositions || !spotMarketTokens) {
      return {
        totalBalance: 0,
        spotBalance: 0,
        perpBalance: 0,
        vaultBalance: 0,
        stakedBalance: 0,
      };
    }

    // Calculer la valeur totale des positions spot
    const spotTotal = spotBalances.reduce((total, balance) => {
      const marketToken = spotMarketTokens.find(t => t.name.toLowerCase() === balance.coin.toLowerCase());
      if (!marketToken) return total;
      
      const value = parseFloat(balance.total) * marketToken.price;
      return total + value;
    }, 0);

    // Récupérer la valeur du compte en perp directement depuis marginSummary
    const perpTotal = parseFloat(perpPositions.marginSummary.accountValue);

    // Pour l'instant, on n'a pas de données sur les vaults et staked
    const vaultTotal = 0;
    const stakedTotal = 0;

    return {
      totalBalance: spotTotal + perpTotal + vaultTotal + stakedTotal,
      spotBalance: spotTotal,
      perpBalance: perpTotal,
      vaultBalance: vaultTotal,
      stakedBalance: stakedTotal,
    };
  }, [spotBalances, perpPositions, spotMarketTokens]);

  const isBalanceLoading = isLoading || isSpotMarketLoading;

  return {
    balances,
    isLoading: isBalanceLoading,
    error,
    refresh: () => {
      refresh();
      refetchSpotMarket();
    }
  };
} 