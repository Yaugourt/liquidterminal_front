"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Loader2, RefreshCw } from "lucide-react";
import { useWalletData } from "@/services/wallets/hooks/useWalletData";
import { calculateWalletStats } from "@/services/wallets/api";
import { Button } from "@/components/ui/button";

export function PerformanceChart() {
  const { activeWallet, refreshActiveWallet } = useWalletData();
  const [totalValue, setTotalValue] = useState(0);
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

  // Calculer la valeur totale à partir des données du wallet (mémorisé)
  const calculatedTotalValue = useMemo(() => {
    if (!activeWallet?.info) return 0;
    
    const { totalBalance } = calculateWalletStats(activeWallet.info);
    return totalBalance;
  }, [activeWallet?.info]);

  useEffect(() => {
    // Éviter les mises à jour multiples
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    setIsLoading(true);
    
    // Utiliser un court délai pour montrer l'état de chargement
    const timer = setTimeout(() => {
      setTotalValue(calculatedTotalValue);
      setIsLoading(false);
      isUpdatingRef.current = false;
    }, 300);
    
    return () => {
      clearTimeout(timer);
      isUpdatingRef.current = false;
    };
  }, [calculatedTotalValue]);

  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <LineChart size={18} className="text-[#83E9FF]" />
          Performance
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[#FFFFFF99] text-sm mb-1">Total value</p>
            <p className="text-white text-xl">{formatCurrency(totalValue)}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="text-[#83E9FF] hover:text-white hover:bg-[#1692ADB2]"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualiser</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full bg-[#041220] rounded-md flex items-center justify-center text-[#FFFFFF99] mt-2">
          Chart coming soon
        </div>
      </CardContent>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#051728CC] z-10">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      )}
    </Card>
  );
}
