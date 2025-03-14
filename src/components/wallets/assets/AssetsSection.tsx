"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Database, RefreshCw } from "lucide-react";
import { AssetsTable } from "./AssetsTable";
import { useWalletData } from "@/services/wallets/hooks/useWalletData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AssetsSection() {
  const { activeWallet, hasWallets, refreshActiveWallet } = useWalletData();
  const [viewType, setViewType] = useState<"spot" | "perp">("spot");
  const [holdingsCount, setHoldingsCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isUpdatingRef = useRef(false);
  
  // Mémoriser les holdings pour éviter des recalculs inutiles
  const holdings = useMemo(() => 
    activeWallet?.info?.holdings || [],
    [activeWallet?.info?.holdings]
  );
  
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
  
  // Fonction pour changer le type de vue
  const handleViewTypeChange = useCallback((type: "spot" | "perp") => {
    setViewType(type);
  }, []);
  
  // Utiliser useEffect pour mettre à jour le nombre d'assets côté client uniquement
  // et gérer l'état de chargement
  useEffect(() => {
    // Éviter les mises à jour multiples
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    setIsLoading(true);
    
    // Utiliser un court délai pour montrer l'état de chargement
    const timer = setTimeout(() => {
      setHoldingsCount(holdings.length);
      setIsLoading(false);
      isUpdatingRef.current = false;
    }, 300);
    
    return () => {
      clearTimeout(timer);
      isUpdatingRef.current = false;
    };
  }, [holdings]);
  
  // Mémoriser les classes CSS pour les boutons de type de vue
  const spotButtonClasses = useMemo(() => 
    cn(
      "rounded-md px-4 sm:px-8 py-2 text-xs sm:text-sm font-medium",
      viewType === "spot"
        ? "bg-[#1692ADB2] text-white border-[#83E9FF4D]"
        : "bg-[#051728] text-[#FFFFFF99] border-[#83E9FF4D] hover:bg-[#0C2237]"
    ),
    [viewType]
  );
  
  const perpButtonClasses = useMemo(() => 
    cn(
      "rounded-md px-4 sm:px-8 py-2 text-xs sm:text-sm font-medium",
      viewType === "perp"
        ? "bg-[#1692ADB2] text-white border-[#83E9FF4D]"
        : "bg-[#051728] text-[#FFFFFF99] border-[#83E9FF4D] hover:bg-[#0C2237]"
    ),
    [viewType]
  );
  
  return (
    <div className="relative space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className={spotButtonClasses}
            onClick={() => handleViewTypeChange("spot")}
          >
            Spot
          </Button>
          <Button
            variant="outline"
            className={perpButtonClasses}
            onClick={() => handleViewTypeChange("perp")}
          >
            Perps
          </Button>
        </div>
        <div className="flex items-center gap-4 justify-between sm:justify-end">
          <div className="flex items-center text-[#FFFFFF99] text-xs sm:text-sm">
            <Database size={16} className="mr-2" />
            Total assets: {holdingsCount !== null ? holdingsCount : '—'}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="text-[#83E9FF] hover:text-white hover:bg-[#1692ADB2]"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
      </div>

      <Card className="bg-transparent border-0 shadow-none overflow-hidden rounded-lg">
        <CardContent className="p-0">
          <AssetsTable holdings={holdings} loading={isLoading} />
        </CardContent>
      </Card>
      
      {!hasWallets && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#051728CC] p-4 rounded-lg text-center z-10">
          <p className="text-white">Ajoutez un wallet pour voir vos assets</p>
        </div>
      )}
    </div>
  );
}
