"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAddressBalance } from "@/services/explorer/address";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { usePortfolio } from "@/services/explorer/address/hooks/usePortfolio";
import { useNumberFormat } from '@/store/number-format.store';
import { formatAssetValue } from '@/lib/numberFormatting';

export function PortfolioStats() {
  const [isMounted, setIsMounted] = useState(false);
  const [volumeTimeframe, setVolumeTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const { getActiveWallet } = useWallets();
  const { format } = useNumberFormat();
  const activeWallet = getActiveWallet();
  const { balances, isLoading, error } = useAddressBalance(activeWallet?.address || '');
  const { perpPositions } = useWalletsBalances(activeWallet?.address || '');
  const { data: portfolioData } = usePortfolio(activeWallet?.address || '');
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

  // Mapping des périodes de l'API vers les tabs
  const timeframeMapping = useMemo(() => ({
    '24h': 'day',
    '7d': 'week', 
    '30d': 'month',
    'all': 'allTime'
  } as const), []);

  // Données de volume calculées depuis l'API portfolio
  const volumeData = useMemo(() => {
    if (!portfolioData || portfolioData.length === 0) {
      return {
        perpVolume: 0,
        spotVaultVolume: 0,
        totalVolume: 0
      };
    }

    const currentTimeframe = timeframeMapping[volumeTimeframe];
    
    // Trouver les données pour la période actuelle
    const totalData = portfolioData.find(([period]) => period === currentTimeframe);
    const perpData = portfolioData.find(([period]) => period === `perp${currentTimeframe.charAt(0).toUpperCase() + currentTimeframe.slice(1)}`);

    if (!totalData || !perpData) {
      return {
        perpVolume: 0,
        spotVaultVolume: 0,
        totalVolume: 0
      };
    }

    const totalVolume = parseFloat(totalData[1].vlm);
    const perpVolume = parseFloat(perpData[1].vlm);
    const spotVaultVolume = totalVolume - perpVolume;

    return {
      perpVolume,
      spotVaultVolume: Math.max(0, spotVaultVolume), // Éviter les valeurs négatives
      totalVolume
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioData, volumeTimeframe]);

  // Fonction pour copier l'adresse
  const copyToClipboard = useCallback(() => {
    if (activeWallet?.address) {
      navigator.clipboard.writeText(activeWallet.address)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Error handled silently
        });
    }
  }, [activeWallet?.address]);

  if (!isMounted) {
    return (
      <Card className="h-full bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-6 rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center bg-[#051728CC] z-10">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full space-y-4">
      {/* Adresse du wallet - libre sans card */}
      {activeWallet && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#FFFFFF] text-xs">
              {activeWallet.address}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 p-0 text-[#F9E370] hover:text-white hover:bg-[#1692ADB2]"
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
          <span className="text-[#F9E370] text-xs">Last tx: 1h ago</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          Error loading portfolio data
        </div>
      ) : (
        <>
          {/* Layout en 2 colonnes : Balances à gauche, Long/Short à droite */}
          <div className="grid grid-cols-2 gap-4">
            {/* Colonne gauche : Balances */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-[#051728] border-2 border-[#83E9FF4D] p-3 rounded-lg">
                <p className="text-white text-xs">Spot Balance</p>
                <p className="text-white text-sm font-medium">{formatCurrency(balances.spotBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-[#051728] border-2 border-[#83E9FF4D] p-3 rounded-lg">
                <p className="text-white text-xs">Perp Balance</p>
                <p className="text-white text-sm font-medium">{formatCurrency(balances.perpBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-[#051728] border-2 border-[#83E9FF4D] p-3 rounded-lg">
                <p className="text-white text-xs">Vault Balance</p>
                <p className="text-white text-sm font-medium">{formatCurrency(balances.vaultBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-[#051728] border-2 border-[#83E9FF4D] p-3 rounded-lg">
                <p className="text-white text-xs">Staked Balance</p>
                <p className="text-white text-sm font-medium">{formatCurrency(balances.stakedBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-[#051728] border-2 border-[#83E9FF4D] p-3 rounded-lg">
                <p className="text-white text-xs">Total Balance</p>
                <p className="text-white text-sm font-medium">{formatCurrency(balances.totalBalance)}</p>
              </div>
            </div>

                        {/* Colonne droite : Long/Short Ratio */}
            <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] p-3 rounded-lg h-full">
              <div className="flex flex-col h-full">
                {/* Section 1: Volumes */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-xs font-medium">Volume</p>
                    <div className="flex gap-1">
                      {(['24h', '7d', '30d', 'all'] as const).map((timeframe) => (
                        <button
                          key={timeframe}
                          onClick={() => setVolumeTimeframe(timeframe)}
                          className={`px-2 py-1 text-xs rounded ${
                            volumeTimeframe === timeframe
                              ? 'bg-[#83E9FF] text-[#051728] font-medium'
                              : 'text-[#FFFFFF80] hover:text-white'
                          }`}
                        >
                          {timeframe}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <p className="text-white text-xs">Perp:</p>
                      <p className="text-white text-sm font-medium">{formatCurrency(volumeData.perpVolume)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-white text-xs">Spot + Vault:</p>
                      <p className="text-white text-sm font-medium">{formatCurrency(volumeData.spotVaultVolume)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-white text-xs">Total:</p>
                      <p className="text-white text-sm font-medium">{formatCurrency(volumeData.totalVolume)}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Long/Short Ratio */}
                <div className="space-y-2 pt-2 border-t border-[#FFFFFF0A] mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-[#4ADE80] text-xs font-medium">
                      Long: {formatAbbreviated(longShortData.longValue)}
                    </span>
                    <span className="text-[#FF5757] text-xs font-medium">
                      Short: {formatAbbreviated(longShortData.shortValue)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1 bg-[#FFFFFF0A] rounded-full overflow-hidden relative">
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
                  
                  {/* Withdrawable en bas */}
                  <div className="flex justify-between items-center pt-2 border-t border-[#FFFFFF0A]">
                    <p className="text-white text-xs">Withdrawable:</p>
                    <p className="text-white text-sm font-medium">{formatCurrency(0)}</p>
                  </div>
                </div>
              </div>
            </Card>

          </div>


        </>
      )}
    </div>
  );
}
