import { useMemo } from "react";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useDelegatorSummary } from "@/services/explorer/validator/hooks/delegator/useDelegatorSummary";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";

export function useAddressBalance(address: string) {
  // Utiliser les hooks directement dans le composant
  const { spotBalances, perpPositions, isLoading: balancesLoading, error: balancesError, refresh: refreshBalances } = useWalletsBalances(address);
  const { data: spotMarketTokens, isLoading: tokensLoading, error: tokensError, refetch: refreshTokens } = useSpotTokens({ limit: 100 });
  const { summary: stakingSummary, isLoading: stakingLoading, error: stakingError, refetch: refreshStaking } = useDelegatorSummary(address);
  const { price: hypePrice } = useHypePrice();

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
      const normalizedCoin = balance.coin.toLowerCase();
      
      // Stablecoins ont toujours un prix de $1
      const stablecoins = ['usdc', 'usdt', 'dai', 'busd', 'tusd'];
      const isStablecoin = stablecoins.includes(normalizedCoin);
      
      let price = 0;
      if (isStablecoin) {
        price = 1;
      } else {
        const marketToken = spotMarketTokens.find(t => t.name.toLowerCase() === normalizedCoin);
        price = marketToken ? marketToken.price : 0;
      }
      
      if (price === 0) return total;
      
      const value = parseFloat(balance.total) * price;
      return total + value;
    }, 0);

    // Récupérer la valeur du compte en perp directement depuis marginSummary
    const perpTotal = parseFloat(perpPositions.marginSummary.accountValue);

    // Pour l'instant, on n'a pas de données sur les vaults
    const vaultTotal = 0;
    
    // Calculer le total staké en $ (delegated + undelegated)
    const stakedTotal = stakingSummary && hypePrice ? 
      (parseFloat(stakingSummary.delegated) + parseFloat(stakingSummary.undelegated)) * hypePrice : 0;

    return {
      totalBalance: spotTotal + perpTotal + vaultTotal + stakedTotal,
      spotBalance: spotTotal,
      perpBalance: perpTotal,
      vaultBalance: vaultTotal,
      stakedBalance: stakedTotal,
    };
  }, [spotBalances, perpPositions, spotMarketTokens, stakingSummary, hypePrice]);

  const refresh = async () => {
    await Promise.all([refreshBalances(), refreshTokens(), refreshStaking()]);
  };

  return {
    balances,
    isLoading: balancesLoading || tokensLoading || stakingLoading,
    error: balancesError || tokensError || stakingError,
    refresh
  };
} 