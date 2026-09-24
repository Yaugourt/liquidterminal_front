import { useMemo } from "react";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useDelegatorSummary } from "@/services/explorer/validator/hooks/delegator/useDelegatorSummary";
import { useHypeLivePrice } from "@/services/market/hype/hooks/useHypePrice";
import { useVaultDeposits } from "@/services/explorer/vault/hooks/useVaultDeposits";
import { useEvmComposition, useDefiPositions, useWalletNfts } from "@/services/market/tracker/hyperfolio";

interface UseAddressBalanceOptions {
  /**
   * Also fold HyperEVM balances (wallet tokens, DeFi positions, NFTs — via the
   * Hyperfolio proxy) into the totals. Off by default: the explorer address
   * page has no EVM panels and should not open those feeds.
   */
  includeEvm?: boolean;
}

export function useAddressBalance(address: string, options: UseAddressBalanceOptions = {}) {
  const evmAddress = options.includeEvm ? address : "";
  // Utiliser les hooks directement dans le composant
  const { spotBalances, perpPositions, isLoading: balancesLoading, error: balancesError, refresh: refreshBalances } = useWalletsBalances(address);
  const { data: spotMarketTokens, isLoading: tokensLoading, error: tokensError, refetch: refreshTokens } = useSpotTokens({ limit: 100 });
  const { summary: stakingSummary, isLoading: stakingLoading, error: stakingError, refetch: refreshStaking } = useDelegatorSummary(address);
  const hypePrice = useHypeLivePrice();
  // Vault equity from HL userVaultEquities (keyless); folded into the totals below.
  const { totalEquity: vaultTotal, isLoading: vaultLoading } = useVaultDeposits(address);

  // HyperEVM side (Hyperfolio). Positions stream in protocol by protocol, so
  // the DeFi figure grows until `defi.status === "complete"`.
  const evm = useEvmComposition(evmAddress);
  const defi = useDefiPositions(evmAddress);
  const nfts = useWalletNfts(evmAddress, 1);

  const evmBalances = useMemo(() => {
    const composition = evm.composition;
    // Receipt tokens (kHYPE, hb*, vault shares…) sit both in the wallet
    // composition and inside a DeFi position — count them once, on the DeFi side.
    const positionTokens = new Set(
      defi.protocols.flatMap((p) => p.positions.flatMap((pos) => pos.tokens.map((t) => t.address)))
    );
    const doubleCounted = composition
      ? composition.tokens.filter((t) => positionTokens.has(t.address)).reduce((sum, t) => sum + t.value, 0)
      : 0;
    const evmBalance = composition ? Math.max(0, composition.totalValue - doubleCounted) : 0;
    const defiBalance = defi.protocols.reduce((sum, p) => sum + p.totalValue, 0);
    return {
      evmBalance,
      defiBalance,
      nftBalance: nfts.totalValue,
      evmAvailable: Boolean(composition) || defi.status === "complete",
    };
  }, [evm.composition, defi.protocols, defi.status, nfts.totalValue]);

  // Calculer les statistiques du portefeuille
  const balances = useMemo(() => {
    if (!spotBalances || !perpPositions || !spotMarketTokens) {
      return {
        totalBalance: 0,
        spotBalance: 0,
        perpBalance: 0,
        vaultBalance: 0,
        stakedBalance: 0,
        evmBalance: 0,
        defiBalance: 0,
        nftBalance: 0,
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

    // Calculer le total staké en $ (delegated + undelegated)
    const stakedTotal = stakingSummary && hypePrice ? 
      (parseFloat(stakingSummary.delegated) + parseFloat(stakingSummary.undelegated)) * hypePrice : 0;

    const { evmBalance, defiBalance, nftBalance } = evmBalances;

    return {
      totalBalance: spotTotal + perpTotal + vaultTotal + stakedTotal + evmBalance + defiBalance + nftBalance,
      spotBalance: spotTotal,
      perpBalance: perpTotal,
      vaultBalance: vaultTotal,
      stakedBalance: stakedTotal,
      evmBalance,
      defiBalance,
      nftBalance,
    };
  }, [spotBalances, perpPositions, spotMarketTokens, stakingSummary, hypePrice, vaultTotal, evmBalances]);

  const refresh = async () => {
    await Promise.all([refreshBalances(), refreshTokens(), refreshStaking()]);
    if (options.includeEvm) {
      evm.refetch();
      defi.refresh();
      nfts.refetch();
    }
  };

  return {
    balances,
    /** Raw spot balances (HL `spotClearinghouseState`) — for the distribution chart. */
    spotBalances,
    /** Raw perp clearinghouse state (open positions, margin) — for callers
     *  that need position-level detail without opening a second feed. */
    perpPositions,
    isLoading: balancesLoading || tokensLoading || stakingLoading || vaultLoading,
    error: balancesError || tokensError || stakingError,
    /** HyperEVM feeds still loading (kept apart so HyperCore cards render first). */
    evmLoading: options.includeEvm
      ? (evm.isLoading && !evm.composition) || defi.status === "streaming" || (nfts.isLoading && nfts.totalItems === 0)
      : false,
    evmError: options.includeEvm ? evm.error ?? (defi.status === "error" || defi.status === "rate-limited" ? new Error(defi.error ?? "HyperEVM data unavailable") : null) : null,
    evmAvailable: evmBalances.evmAvailable,
    refresh
  };
} 