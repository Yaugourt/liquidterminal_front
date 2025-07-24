import { useState, useEffect } from 'react';
import { useWallets } from "@/store/use-wallets";
import { useWalletsBalances } from "@/services/wallets/hooks/useWalletsBalances";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { truncateAddress } from '@/lib/numberFormatting';

interface UseWalletDataProps {
  addressOverride?: string;
}

export function useWalletData({ addressOverride }: UseWalletDataProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeWalletDisplay, setActiveWalletDisplay] = useState<string | null>(null);

  const { getActiveWallet } = useWallets();
  const activeWallet = getActiveWallet();
  
  // Utiliser l'adresse override ou l'adresse du wallet actif
  const walletAddress = addressOverride || activeWallet?.address;
  
  // Utiliser les hooks pour récupérer les balances et les données de marché
  const { spotBalances, perpPositions, isLoading, error, refresh } = useWalletsBalances(walletAddress);
  const { data: spotMarketTokens, isLoading: isSpotMarketLoading, refetch: refetchSpotMarket } = useSpotTokens({ 
    limit: 200,
    sortBy: "volume",
    sortOrder: "desc",
  });
  const { data: perpMarketTokens, isLoading: isPerpMarketLoading, refetch: refetchPerpMarket } = usePerpMarkets({
    limit: 200,
    defaultParams: {
      sortBy: "volume",
      sortOrder: "desc",
    }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Effet pour mettre à jour l'affichage du wallet actif
  useEffect(() => {
    if (!isMounted) return;

    if (addressOverride) {
      setActiveWalletDisplay(truncateAddress(addressOverride));
    } else if (activeWallet) {
      const display = activeWallet.name || truncateAddress(activeWallet.address);
      setActiveWalletDisplay(display);
    } else {
      setActiveWalletDisplay(null);
    }
  }, [activeWallet, addressOverride, isMounted]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refresh(), refetchSpotMarket(), refetchPerpMarket()]);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  return {
    walletAddress,
    activeWalletDisplay,
    spotBalances,
    perpPositions,
    spotMarketTokens,
    perpMarketTokens,
    isLoading,
    isSpotMarketLoading,
    isPerpMarketLoading,
    isRefreshing,
    isMounted,
    error,
    handleRefresh
  };
} 