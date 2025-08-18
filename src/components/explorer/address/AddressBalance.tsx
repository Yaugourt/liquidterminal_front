"use client";

import { useMemo, useCallback } from "react";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/numberFormatting';
import { AddressBalanceProps } from "@/components/types/explorer.types";

export function AddressBalance({ address }: AddressBalanceProps) {
  const { spotBalances, perpPositions, isLoading, error } = useWalletsBalances(address);
  const { data: spotMarketTokens, isLoading: isSpotMarketLoading } = useSpotTokens({ limit: 100 });
  const { format } = useNumberFormat();

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
    return formatNumber(value, format, { currency: '$', showCurrency: true });
  }, [format]);

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