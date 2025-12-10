"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallets } from "@/store/use-wallets";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAddressBalance } from "@/services/explorer/address";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { usePortfolio } from "@/services/explorer/address/hooks/usePortfolio";
import { useNumberFormat } from '@/store/number-format.store';
import { formatAssetValue } from '@/lib/formatters/numberFormatting';

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
      <div className="h-full bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-6">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 text-brand-accent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-4">
      {/* Wallet address header */}
      {activeWallet && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white text-xs font-mono">
              {activeWallet.address}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 p-0 text-zinc-500 hover:text-white hover:bg-white/5"
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
          <span className="text-brand-accent text-xs">Last tx: 1h ago</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-6 h-6 text-brand-accent animate-spin" />
        </div>
      ) : error ? (
        <div className="text-rose-400 text-center py-4">
          Error loading portfolio data
        </div>
      ) : (
        <>
          {/* Layout en 2 colonnes : Balances à gauche, Long/Short à droite */}
          <div className="grid grid-cols-2 gap-4">
            {/* Colonne gauche : Balances */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-brand-secondary/60 backdrop-blur-md border border-white/5 p-3 rounded-xl hover:border-white/10 transition-all">
                <p className="text-zinc-400 text-xs">Spot Balance</p>
                <p className="text-white text-sm font-bold">{formatCurrency(balances.spotBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-brand-secondary/60 backdrop-blur-md border border-white/5 p-3 rounded-xl hover:border-white/10 transition-all">
                <p className="text-zinc-400 text-xs">Perp Balance</p>
                <p className="text-white text-sm font-bold">{formatCurrency(balances.perpBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-brand-secondary/60 backdrop-blur-md border border-white/5 p-3 rounded-xl hover:border-white/10 transition-all">
                <p className="text-zinc-400 text-xs">Vault Balance</p>
                <p className="text-white text-sm font-bold">{formatCurrency(balances.vaultBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-brand-secondary/60 backdrop-blur-md border border-white/5 p-3 rounded-xl hover:border-white/10 transition-all">
                <p className="text-zinc-400 text-xs">Staked Balance</p>
                <p className="text-white text-sm font-bold">{formatCurrency(balances.stakedBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-brand-secondary/60 backdrop-blur-md border border-white/5 p-3 rounded-xl hover:border-white/10 transition-all">
                <p className="text-zinc-400 text-xs">Total Balance</p>
                <p className="text-white text-sm font-bold">{formatCurrency(balances.totalBalance)}</p>
              </div>
            </div>

            {/* Colonne droite : Long/Short Ratio */}
            <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-4 h-full">
              <div className="flex flex-col h-full">
                {/* Section 1: Volumes */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Volume</p>
                    <div className="flex bg-brand-dark rounded-lg p-0.5 border border-white/5">
                      {(['24h', '7d', '30d', 'all'] as const).map((timeframe) => (
                        <button
                          key={timeframe}
                          onClick={() => setVolumeTimeframe(timeframe)}
                          className={`px-2 py-1 text-[10px] rounded-md transition-all ${
                            volumeTimeframe === timeframe
                              ? 'bg-brand-accent text-brand-tertiary font-bold'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {timeframe}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-zinc-400 text-xs">Perp:</p>
                      <p className="text-white text-sm font-bold">{formatCurrency(volumeData.perpVolume)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-zinc-400 text-xs">Spot + Vault:</p>
                      <p className="text-white text-sm font-bold">{formatCurrency(volumeData.spotVaultVolume)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-zinc-400 text-xs">Total:</p>
                      <p className="text-white text-sm font-bold">{formatCurrency(volumeData.totalVolume)}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Long/Short Ratio */}
                <div className="space-y-2 pt-3 border-t border-white/5 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 text-xs font-medium">
                      Long: {formatAbbreviated(longShortData.longValue)}
                    </span>
                    <span className="text-rose-400 text-xs font-medium">
                      Short: {formatAbbreviated(longShortData.shortValue)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                      {longShortData.totalValue > 0 && (
                        <>
                          {/* Long positions bar */}
                          <div
                            className="h-full bg-emerald-400 transition-all duration-500 absolute left-0"
                            style={{
                              width: `${longShortData.longPercentage}%`
                            }}
                          />
                          {/* Short positions bar */}
                          <div
                            className="h-full bg-rose-400 transition-all duration-500 absolute right-0"
                            style={{
                              width: `${100 - longShortData.longPercentage}%`
                            }}
                          />
                        </>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>{longShortData.longPercentage.toFixed(1)}% Long</span>
                      <span>{(100 - longShortData.longPercentage).toFixed(1)}% Short</span>
                    </div>
                  </div>
                  
                  {/* Withdrawable */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <p className="text-zinc-400 text-xs">Withdrawable:</p>
                    <p className="text-white text-sm font-bold">{formatCurrency(0)}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>


        </>
      )}
    </div>
  );
}
