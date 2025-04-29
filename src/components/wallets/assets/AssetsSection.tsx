"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Database, RefreshCw, AlertCircle } from "lucide-react";
import { AssetsTable, Holding } from "./AssetsTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWalletsBalances } from "@/services/wallets/hooks/useWalletsBalances";
import { useWallets } from "@/store/use-wallets";
import { HyperliquidPerpAssetPosition } from "@/services/wallets/types";

export function AssetsSection() {
  const [viewType, setViewType] = useState<"spot" | "perp">("spot");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeWalletDisplay, setActiveWalletDisplay] = useState<string | null>(null);
  
  // Utiliser les hooks pour récupérer les balances
  const { spotBalances, perpPositions, isLoading, error, refresh } = useWalletsBalances();
  const { getActiveWallet } = useWallets();
  const activeWallet = getActiveWallet();
  
  // Effet pour marquer que nous sommes côté client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Effet pour mettre à jour l'affichage du wallet actif
  useEffect(() => {
    if (activeWallet) {
      const display = activeWallet.name || 
        `${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}`;
      setActiveWalletDisplay(display);
    } else {
      setActiveWalletDisplay(null);
    }
  }, [activeWallet]);
  
  // Convertir les balances Hyperliquid en holdings
  const convertedHoldings = useMemo(() => {
    console.log("AssetsSection: viewType =", viewType);
    console.log("AssetsSection: spotBalances =", spotBalances);
    console.log("AssetsSection: perpPositions =", perpPositions);
    
    if (viewType === "spot" && spotBalances) {
      const holdings = spotBalances.map(balance => ({
        coin: balance.coin,
        token: "USDC", // Conversion du token number en string
        total: balance.total,
        entryNtl: balance.entryNtl
      })) as Holding[];
      console.log("AssetsSection: Spot holdings =", holdings);
      return holdings;
    } else if (viewType === "perp" && perpPositions) {
      const holdings = perpPositions.assetPositions.map(position => ({
        coin: position.position.coin,
        token: "USDC",
        total: position.position.szi,
        entryNtl: position.position.entryPx
      })) as Holding[];
      console.log("AssetsSection: Perp holdings =", holdings);
      return holdings;
    }
    console.log("AssetsSection: No holdings to display");
    return [];
  }, [spotBalances, perpPositions, viewType]);
  
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
  
  // Fonction pour changer le type de vue
  const handleViewTypeChange = useCallback((type: "spot" | "perp") => {
    setViewType(type);
  }, []);
  
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

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <Card className="bg-transparent border-0 shadow-none overflow-hidden rounded-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-red-500 space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error || "Une erreur est survenue lors du chargement des assets"}</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
            Total assets: {convertedHoldings.length}
            {isClient && activeWalletDisplay && (
              <span className="ml-2 text-[#83E9FF]">
                ({activeWalletDisplay})
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="text-[#83E9FF] hover:text-white hover:bg-[#1692ADB2]"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
      </div>

      <Card className="bg-transparent border-0 shadow-none overflow-hidden rounded-lg">
        <CardContent className="p-0">
          <AssetsTable holdings={convertedHoldings} loading={isLoading || isRefreshing} />
        </CardContent>
      </Card>
    </div>
  );
}
