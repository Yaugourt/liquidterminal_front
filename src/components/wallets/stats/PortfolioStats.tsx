"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWalletsBalances } from "@/services/wallets/hooks/useWalletsBalances";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";

export function PortfolioStats() {
  const { spotBalances, perpPositions, isLoading, error, refresh } = useWalletsBalances();
  const { data: spotMarketTokens, isLoading: isSpotMarketLoading } = useSpotTokens({ limit: 100 });
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Fonction pour formater les valeurs monétaires (mémorisée)
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refresh]);

  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white text-lg">Statistiques du portefeuille</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="text-[#83E9FF] hover:text-white hover:bg-[#1692ADB2]"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
      
      {(isLoading || isSpotMarketLoading) ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#051728CC] z-10">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          Une erreur est survenue lors du chargement des données
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-6">
          <div>
            <p className="text-[#FFFFFF99] text-sm mb-1">Balance totale:</p>
            <p className="text-white text-xl">{formatCurrency(stats.totalBalance)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-sm mb-1">Balance Spot:</p>
            <p className="text-white text-xl">{formatCurrency(stats.spotBalance)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-sm mb-1">Balance Perp:</p>
            <p className="text-white text-xl">{formatCurrency(stats.perpBalance)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-sm mb-1">Évolution 24h:</p>
            <p className="text-[#FF5252] text-xl">-</p>
          </div>
        </div>
      )}
    </Card>
  );
}
