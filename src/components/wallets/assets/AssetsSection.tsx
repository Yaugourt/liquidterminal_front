"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Database, RefreshCw, AlertCircle } from "lucide-react";
import { AssetsTable } from "./AssetsTable";
import { HoldingDisplay, PerpHoldingDisplay } from "@/components/types/wallet.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWalletsBalances } from "@/services/wallets/hooks/useWalletsBalances";
import { useWallets } from "@/store/use-wallets";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/formatting';

// Ajouter l'interface pour les props
interface AssetsSectionProps {
  initialViewType?: "spot" | "perp";
  addressOverride?: string;
}

export function AssetsSection({ initialViewType = "spot", addressOverride }: AssetsSectionProps) {
  const [viewType, setViewType] = useState<"spot" | "perp">(initialViewType);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeWalletDisplay, setActiveWalletDisplay] = useState<string | null>(null);
  const { format } = useNumberFormat();
  
  const { getActiveWallet } = useWallets();
  const activeWallet = getActiveWallet();
  
  // Utiliser l'adresse override ou l'adresse du wallet actif
  const walletAddress = addressOverride || activeWallet?.address;
  
  // Utiliser les hooks pour récupérer les balances et les données de marché
  const { spotBalances, perpPositions, isLoading, error, refresh } = useWalletsBalances(walletAddress);
  const { data: spotMarketTokens, isLoading: isSpotMarketLoading, refetch: refetchSpotMarket } = useSpotTokens({ 
    limit: 200,
    defaultParams: {
      sortBy: "volume",
      sortOrder: "desc",
    } 
  });
  
  // Si aucune adresse n'est disponible, afficher un message
  if (!walletAddress) {
    return (
      <Card className="bg-transparent border-0 shadow-none overflow-hidden rounded-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-[#FFFFFF99] space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Veuillez sélectionner un wallet pour voir vos assets</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Effet pour mettre à jour l'affichage du wallet actif
  useEffect(() => {
    if (!isMounted) return;

    if (addressOverride) {
      setActiveWalletDisplay(`${addressOverride.slice(0, 6)}...${addressOverride.slice(-4)}`);
    } else if (activeWallet) {
      const display = activeWallet.name || 
        `${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}`;
      setActiveWalletDisplay(display);
    } else {
      setActiveWalletDisplay(null);
    }
  }, [activeWallet, addressOverride, isMounted]);

  // Normaliser les noms de token pour faciliter la correspondance
  const normalizeTokenName = useCallback((name: string): string => {
    return name.toLowerCase().trim();
  }, []);
  
  // Convertir les balances en holdings enrichis avec le marché spot
  const convertedHoldings = useMemo(() => {
    if (viewType === "spot" && spotBalances && spotMarketTokens) {
      return spotBalances.map(balance => {
        const normalizedBalanceCoin = normalizeTokenName(balance.coin);
        
        // Rechercher le token dans les données de marché en normalisant les noms
        const marketToken = spotMarketTokens.find(t => {
          const normalizedMarketName = normalizeTokenName(t.name);
          return normalizedMarketName === normalizedBalanceCoin;
        });
        
        // Calculer la valeur totale basée sur le prix du marché si disponible
        const price = marketToken ? parseFloat(marketToken.price.toString()) : 0;
        const total = parseFloat(balance.total);
        const totalValue = price * total;
        const entryPrice = parseFloat(balance.entryNtl || "0");
        const pnl = totalValue - (entryPrice * total);
        
        const holding: HoldingDisplay = {
          id: `${balance.coin}-${balance.token || 'USDC'}`,
          coin: balance.coin,
          token: "USDC",
          total: balance.total,
          totalValue: totalValue,
          entryPrice: entryPrice,
          entryNtl: balance.entryNtl || "0",
          price: price,
          pnl: pnl,
          pnlPercentage: marketToken ? parseFloat(marketToken.change24h.toString()) : 0,
          logo: marketToken?.logo || undefined,
        };
        
        return holding;
      });
    } else if (viewType === "perp" && perpPositions && spotMarketTokens) {
      return perpPositions.assetPositions.map(position => {
        const normalizedPositionCoin = normalizeTokenName(position.position.coin);
        
        // Rechercher le token dans les données de marché
        const marketToken = spotMarketTokens.find(t => {
          const normalizedMarketName = normalizeTokenName(t.name);
          return normalizedMarketName === normalizedPositionCoin;
        });
        
        const szi = parseFloat(position.position.szi);
        const entryPx = parseFloat(position.position.entryPx);
        const marginUsed = parseFloat(position.position.marginUsed);
        const liquidationPx = parseFloat(position.position.liquidationPx);
        const positionValue = Math.abs(szi) * entryPx;
        
        // Prix actuel du marché pour calculer le PNL
        const currentPrice = marketToken ? parseFloat(marketToken.price.toString()) : entryPx;
        const pnl = szi > 0 
          ? (currentPrice - entryPx) * Math.abs(szi) 
          : (entryPx - currentPrice) * Math.abs(szi);
        
        const pnlPercentage = entryPx > 0 
          ? (pnl / (entryPx * Math.abs(szi))) * 100 
          : 0;
        
        const holding: PerpHoldingDisplay = {
          id: `${position.position.coin}-${szi > 0 ? 'long' : 'short'}`,
          coin: position.position.coin,
          type: szi > 0 ? 'Long' : 'Short',
          marginUsed: position.position.marginUsed,
          marginUsedValue: marginUsed,
          positionValue: positionValue.toString(),
          positionValueNum: positionValue,
          entryPrice: position.position.entryPx,
          entryPriceNum: entryPx,
          liquidation: position.position.liquidationPx,
          liquidationNum: liquidationPx,
          logo: marketToken?.logo || undefined,
        };
        
        return holding;
      });
    }
    return [];
  }, [spotBalances, spotMarketTokens, perpPositions, viewType, normalizeTokenName]);
  
  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refresh(), refetchSpotMarket()]);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refresh, refetchSpotMarket]);
  
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
            <span>{error.message || "Une erreur est survenue lors du chargement des assets"}</span>
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
            {isMounted && activeWalletDisplay && (
              <span className="ml-2 text-[#83E9FF]">
                ({activeWalletDisplay})
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading || isSpotMarketLoading}
            className="text-[#83E9FF] hover:text-white hover:bg-[#1692ADB2]"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${(isRefreshing || isLoading || isSpotMarketLoading) ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
      </div>

      <Card className="bg-transparent border-0 shadow-none overflow-hidden rounded-lg">
        <CardContent className="p-0">
          <AssetsTable 
            holdings={convertedHoldings} 
            isLoading={isLoading || isRefreshing || isSpotMarketLoading} 
            type={viewType}
            onSort={() => {}} // TODO: Implement sorting
            formatCurrency={(value) => formatNumber(Number(value), format, {
              currency: '$',
              showCurrency: true,
              minimumFractionDigits: Math.abs(Number(value)) < 0.01 ? 4 : 2,
              maximumFractionDigits: Math.abs(Number(value)) < 0.01 ? 4 : 2
            })}
            formatTokenAmount={(value) => formatNumber(Number(value), format, {
              minimumFractionDigits: Math.abs(Number(value)) >= 1 ? 2 : Math.abs(Number(value)) >= 0.1 ? 3 : 4,
              maximumFractionDigits: Math.abs(Number(value)) >= 1 ? 2 : Math.abs(Number(value)) >= 0.1 ? 3 : 4
            })}
            formatPercent={(value) => {
              const sign = value >= 0 ? '+' : '';
              return sign + formatNumber(Math.abs(value), format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }) + '%';
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
