"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAddressBalance } from "@/services/explorer/hooks/useAddressBalance";
import { formatLargeNumber } from "@/lib/formatting";

export function PortfolioStats() {
  const [isMounted, setIsMounted] = useState(false);
  const [pnlMode, setPnlMode] = useState<'percent' | 'dollar'>('percent');
  const { getActiveWallet } = useWallets();
  const activeWallet = getActiveWallet();
  const { balances, isLoading, error, refresh } = useAddressBalance(activeWallet?.address || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fonction pour formater les valeurs monétaires
  const formatCurrency = useCallback((value: number) => {
    return formatLargeNumber(value, {
      prefix: '$',
      decimals: 2,
      forceDecimals: true
    });
  }, []);

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
      <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all">
        <div className="absolute inset-0 flex items-center justify-center bg-[#051728CC] z-10">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h3 className="text-[15px] text-white font-medium">Statistiques du portefeuille</h3>
          {activeWallet && (
            <div className="flex items-center ml-3">
              <span className="text-[#FFFFFF99] text-xs truncate max-w-[160px]">
                {activeWallet.address}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 p-0 ml-1 text-[#83E9FF]"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Adresse copiée !" : "Copier l'adresse"}</p>
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
                className="text-[#83E9FF] hover:text-white hover:bg-[#1692ADB2]"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Actualiser</p>
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
          Une erreur est survenue lors du chargement des données
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Zone 1: Balances */}
          <div className="space-y-3 border-r border-b border-[#1E3851] pr-6 pb-6">
            <div className="flex justify-between items-center">
              <p className="text-[#FFFFFF80] text-xs">Balance totale:</p>
              <p className="text-white text-sm font-medium">{formatCurrency(balances.totalBalance)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[#FFFFFF80] text-xs">Balance Spot:</p>
              <p className="text-white text-sm font-medium">{formatCurrency(balances.spotBalance)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[#FFFFFF80] text-xs">Balance Perp:</p>
              <p className="text-white text-sm font-medium">{formatCurrency(balances.perpBalance)}</p>
            </div>
          </div>

          {/* Zone 2: PNL */}
          <div className="space-y-3 border-b border-[#1E3851] pb-6">
           
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-[#FFFFFF80] text-xs">All Time:</p>
                <p className="text-[#4ADE80] text-sm font-medium">-</p>
              </div>
              <div>
                <p className="text-[#FFFFFF80] text-xs">24H:</p>
                <p className="text-[#4ADE80] text-sm font-medium">+0.31%</p>
              </div>
              <div>
                <p className="text-[#FFFFFF80] text-xs">7D:</p>
                <p className="text-[#4ADE80] text-sm font-medium">+14.80%</p>
              </div>
              <div>
                <p className="text-[#FFFFFF80] text-xs">30D:</p>
                <p className="text-[#4ADE80] text-sm font-medium">+229.60%</p>
              </div>
            </div>
          </div>

          {/* Zone 3: Vault & Staking */}
          <div className="border-r border-[#1E3851] pt-6 pr-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[#FFFFFF80] text-xs">Total en Vault:</p>
                <p className="text-white text-sm font-medium">{formatCurrency(balances.vaultBalance)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[#FFFFFF80] text-xs">Total en Staking:</p>
                <p className="text-white text-sm font-medium">{formatCurrency(balances.stakedBalance)}</p>
              </div>
              <div className="pt-2">
                <p className="text-[#FFFFFF80] text-xs">
                  Last transaction: <span className="text-[#83E9FF]">1h ago</span>
                </p>
              </div>
            </div>
          </div>

          {/* Zone 4: Long/Short Ratio */}
          <div className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#4ADE80] text-sm font-medium">
                  Long: {formatCurrency(balances.perpBalance > 0 ? balances.perpBalance : 0)}
                </span>
                <span className="text-[#FF5757] text-sm font-medium">
                  Short: {formatCurrency(balances.perpBalance < 0 ? Math.abs(balances.perpBalance) : 0)}
                </span>
              </div>
              <div className="h-2 bg-[#051728] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4ADE80] to-[#FF5757]"
                  style={{
                    width: '100%',
                    backgroundSize: `${balances.perpBalance > 0 ? 75 : 25}% 100%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
