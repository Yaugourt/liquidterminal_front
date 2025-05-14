"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useWalletsBalances } from "@/services/wallets/hooks/useWalletsBalances";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { Loader2 } from "lucide-react";

interface AddressBalanceProps {
  address: string;
}

export function AddressBalance({ address }: AddressBalanceProps) {
  const { spotBalances, perpPositions, isLoading, error } = useWalletsBalances(address);
  const { data: spotMarketTokens, isLoading: isSpotMarketLoading } = useSpotTokens({ limit: 100 });

  // Calculer les statistiques du portefeuille
  const stats = useMemo(() => {
    if (!spotBalances || !perpPositions || !spotMarketTokens) {
      return {
        totalBalance: 0,
        spotBalance: 0,
        perpBalance: 0
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

    return {
      totalBalance: spotTotal + perpTotal,
      spotBalance: spotTotal,
      perpBalance: perpTotal
    };
  }, [spotBalances, perpPositions, spotMarketTokens]);

  // Fonction pour formater les valeurs monétaires
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  if (isLoading || isSpotMarketLoading) {
    return <div className="text-white text-[16px]">Loading...</div>;
  }

  if (error) {
    return <div className="text-[#FF5757] text-[16px]">Error loading balances</div>;
  }

  return (
    <>
      <div className="text-white text-[16px]">{formatCurrency(stats.totalBalance)}</div>
    </>
  );
} 