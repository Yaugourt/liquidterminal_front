"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { calculateWalletStats } from "@/services/wallets/api";
import { WalletStats } from "@/services/wallets/types";
import { useWalletData } from "@/services/wallets/hooks/useWalletData";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortfolioStats() {
  const { activeWallet, refreshActiveWallet } = useWalletData();
  const [stats, setStats] = useState<WalletStats>({
    totalBalance: 0,
    usdcBalance: 0,
    otherTokens: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isUpdatingRef = useRef(false);

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
    if (isRefreshing || !refreshActiveWallet) return;
    
    setIsRefreshing(true);
    try {
      await refreshActiveWallet();
    } catch (error) {
      console.error("Failed to refresh wallet data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshActiveWallet, isRefreshing]);

  // Calculer les statistiques à partir des données du wallet (mémorisé)
  const calculatedStats = useMemo(() => {
    if (!activeWallet?.info) {
      return {
        totalBalance: 0,
        usdcBalance: 0,
        otherTokens: 0
      };
    }
    
    return calculateWalletStats(activeWallet.info);
  }, [activeWallet?.info]);

  useEffect(() => {
    // Éviter les mises à jour multiples
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    setIsLoading(true);
    
    // Utiliser un court délai pour montrer l'état de chargement
    const timer = setTimeout(() => {
      setStats(calculatedStats);
      setIsLoading(false);
      isUpdatingRef.current = false;
    }, 300);
    
    return () => {
      clearTimeout(timer);
      isUpdatingRef.current = false;
    };
  }, [calculatedStats]);

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
      
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#051728CC] z-10">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-6">
          <div>
            <p className="text-[#FFFFFF99] text-sm mb-1">Balance totale:</p>
            <p className="text-white text-xl">{formatCurrency(stats.totalBalance)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-sm mb-1">Évolution du portefeuille:</p>
            <p className="text-[#FF5252] text-xl">-</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-sm mb-1">Balance USDC:</p>
            <p className="text-white text-xl">{formatCurrency(stats.usdcBalance)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-sm mb-1">Autres tokens:</p>
            <p className="text-white text-xl">{formatCurrency(stats.otherTokens)}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
