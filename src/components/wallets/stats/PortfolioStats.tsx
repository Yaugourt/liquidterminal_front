"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAddressBalance } from "@/services/explorer/address";
import { useWalletsBalances } from "@/services/wallets/hooks/useWalletsBalances";
import { useNumberFormat } from '@/store/number-format.store';
import { formatAssetValue } from '@/lib/formatting';

export function PortfolioStats() {
  const [isMounted, setIsMounted] = useState(false);
  const { getActiveWallet } = useWallets();
  const { format } = useNumberFormat();
  const activeWallet = getActiveWallet();
  const { balances, isLoading, error, refresh } = useAddressBalance(activeWallet?.address || '');
  const { perpPositions } = useWalletsBalances(activeWallet?.address || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fonction pour formater les valeurs monétaires selon les settings utilisateur
  const formatCurrency = useCallback((value: number) => {
    return formatAssetValue(value, format);
  }, [format]);

  // Fonction pour formater avec des lettres (K, M, B) pour long/short
  const formatAbbreviated = useCallback((value: number) => {
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  }, []);

  // Calculer les valeurs long/short basées sur les positions perp
  const longShortData = useMemo(() => {
    if (!perpPositions?.assetPositions) {
      return { longValue: 0, shortValue: 0, totalValue: 0, longPercentage: 0 };
    }

    let longValue = 0;
    let shortValue = 0;

    perpPositions.assetPositions.forEach(({ position }) => {
      const szi = parseFloat(position.szi);
      const positionValue = parseFloat(position.positionValue);
      
      if (szi > 0) {
        // Position longue
        longValue += positionValue;
      } else if (szi < 0) {
        // Position courte
        shortValue += positionValue;
      }
    });

    const totalValue = longValue + shortValue;
    const longPercentage = totalValue > 0 ? (longValue / totalValue) * 100 : 0;

    return { longValue, shortValue, totalValue, longPercentage };
  }, [perpPositions]);

  // Fonction pour copier l'adresse
  const copyToClipboard = useCallback(() => {
    if (activeWallet?.address) {
      navigator.clipboard.writeText(activeWallet.address)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Erreur lors de la copie :', err);
        });
    }
  }, [activeWallet?.address]);

  // Fonction pour rafraîchir
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

  if (!isMounted) {
    return (
      <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6 rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center bg-[#051728CC] z-10">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h3 className="text-[15px] text-white font-medium">Portfolio Statistics</h3>
          {activeWallet && (
            <div className="flex items-center ml-3">
              <span className="text-[#83E9FF] text-xs">
                {activeWallet.address}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 p-0 ml-1 text-[#F9E370] hover:text-white hover:bg-[#1692ADB2]"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Address copied!" : "Copy address"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="text-[#F9E370] hover:text-white hover:bg-[#1692ADB2]"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#051728CC] z-10">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          Error loading portfolio data
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Zone 1: Balances */}
          <div className="space-y-4 border-r border-[#FFFFFF0A] pr-6">
            <div className="flex justify-between items-center">
              <p className="text-white text-xs">Total Balance:</p>
              <p className="text-white text-sm font-medium">{formatCurrency(balances.totalBalance)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-white text-xs">Spot Balance:</p>
              <p className="text-white text-sm font-medium">{formatCurrency(balances.spotBalance)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-white text-xs">Perp Balance:</p>
              <p className="text-white text-sm font-medium">{formatCurrency(balances.perpBalance)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-white text-xs">Vault Balance:</p>
              <p className="text-white text-sm font-medium">{formatCurrency(balances.vaultBalance)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-white text-xs">Staked Balance:</p>
              <p className="text-white text-sm font-medium">{formatCurrency(balances.stakedBalance)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-white text-xs">Withdrawable Balance:</p>
              <p className="text-white text-sm font-medium">{formatCurrency(0)}</p>
            </div>
            <div className="pt-2">
              <p className="text-white text-xs">
                Last tx: <span className="text-[#F9E370]">1h ago</span>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Zone 2: PNL */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-white text-xs">All Time:</p>
                  <p className="text-[#FFFFFF80] text-sm font-medium">-</p>
                </div>
                <div>
                  <p className="text-white text-xs">24H:</p>
                  <p className="text-[#4ADE80] text-sm font-medium">+0.31%</p>
                </div>
                <div>
                  <p className="text-white text-xs">7D:</p>
                  <p className="text-[#4ADE80] text-sm font-medium">+14.80%</p>
                </div>
                <div>
                  <p className="text-white text-xs">30D:</p>
                  <p className="text-[#4ADE80] text-sm font-medium">+229.60%</p>
                </div>
              </div>
            </div>

            {/* Zone 3: Long/Short Ratio */}
            <div className="space-y-4 pt-3 border-t border-[#FFFFFF0A]">
              <div className="flex justify-between items-center">
                <span className="text-[#4ADE80] text-sm font-medium">
                  Long: {formatAbbreviated(longShortData.longValue)}
                </span>
                <span className="text-[#FF5757] text-sm font-medium">
                  Short: {formatAbbreviated(longShortData.shortValue)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-[#FFFFFF0A] rounded-full overflow-hidden relative">
                  {longShortData.totalValue > 0 && (
                    <>
                      {/* Barre pour les positions longues */}
                      <div
                        className="h-full bg-[#4ADE80] transition-all duration-500 absolute left-0"
                        style={{
                          width: `${longShortData.longPercentage}%`
                        }}
                      />
                      {/* Barre pour les positions courtes */}
                      <div
                        className="h-full bg-[#FF5757] transition-all duration-500 absolute right-0"
                        style={{
                          width: `${100 - longShortData.longPercentage}%`
                        }}
                      />
                    </>
                  )}
                </div>
                <div className="flex justify-between text-xs text-[#FFFFFF80]">
                  <span>{longShortData.longPercentage.toFixed(1)}% Long</span>
                  <span>{(100 - longShortData.longPercentage).toFixed(1)}% Short</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
