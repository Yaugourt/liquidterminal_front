"use client";

import { useMemo, useCallback } from "react";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/formatters/numberFormatting';
import { AddressBalanceProps } from "@/components/types/explorer.types";
import { Loader2, AlertCircle } from "lucide-react";

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
    return (
      <div className="text-white text-[16px] flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-brand-accent" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-rose-400 text-[16px] flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span>Error loading balances</span>
      </div>
    );
  }

  return (
    <>
      <div className="text-white text-[16px]">{formatCurrency(stats.totalBalance)}</div>
    </>
  );
} 