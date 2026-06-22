"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PeriodSelector } from "@/components/common";
import { useWallets } from "@/store/use-wallets";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAddressBalance } from "@/services/explorer/address";
import { useNumberFormat } from '@/store/number-format.store';
import { formatAssetValue } from '@/lib/formatters/numberFormatting';
import { PortfolioApiResponse } from "@/services/explorer/address/types";
import { HyperliquidPerpResponse } from "@/services/market/tracker/types";

interface PortfolioStatsProps {
  portfolioData?: PortfolioApiResponse | null;
  perpPositions?: HyperliquidPerpResponse | null;
  walletAddress?: string;  // Optional for public view
}

export function PortfolioStats({
  portfolioData,
  perpPositions,
  walletAddress: walletAddressProp
}: PortfolioStatsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [volumeTimeframe, setVolumeTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const { getActiveWallet } = useWallets();
  const { format } = useNumberFormat();
  const activeWallet = getActiveWallet();

  // Use provided address or fall back to active wallet
  const walletAddress = walletAddressProp || activeWallet?.address || '';

  const { balances, isLoading, error } = useAddressBalance(walletAddress);
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
      <Card className="h-full p-6">
        <div className="flex items-center justify-center h-full">
          <InlineSpinner className="w-6 h-6 text-brand" />
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full space-y-4">
      {/* Wallet address header */}
      {activeWallet && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-text-primary text-xs">
              {activeWallet.address}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 text-text-tertiary hover:text-text-primary hover:bg-surface-2"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? "Address copied!" : "Copy address"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <InlineSpinner className="w-6 h-6 text-brand" />
        </div>
      ) : error ? (
        <div className="text-danger text-center py-4">
          Error loading portfolio data
        </div>
      ) : (
        <>
          {/* Layout en 2 colonnes : Balances à gauche, Long/Short à droite */}
          <div className="grid grid-cols-2 gap-4">
            {/* Colonne gauche : Balances */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-surface/60 border border-border-subtle p-3 rounded-lg hover:border-border-default transition-all">
                <p className="text-text-secondary text-xs">Spot Balance</p>
                <p className="text-text-primary text-sm font-bold">{formatCurrency(balances.spotBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-surface/60 border border-border-subtle p-3 rounded-lg hover:border-border-default transition-all">
                <p className="text-text-secondary text-xs">Perp Balance</p>
                <p className="text-text-primary text-sm font-bold">{formatCurrency(balances.perpBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-surface/60 border border-border-subtle p-3 rounded-lg hover:border-border-default transition-all">
                <p className="text-text-secondary text-xs">Vault Balance</p>
                <p className="text-text-primary text-sm font-bold">{formatCurrency(balances.vaultBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-surface/60 border border-border-subtle p-3 rounded-lg hover:border-border-default transition-all">
                <p className="text-text-secondary text-xs">Staked Balance</p>
                <p className="text-text-primary text-sm font-bold">{formatCurrency(balances.stakedBalance)}</p>
              </div>
              <div className="flex justify-between items-center bg-surface/60 border border-border-subtle p-3 rounded-lg hover:border-border-default transition-all">
                <p className="text-text-secondary text-xs">Total Balance</p>
                <p className="text-text-primary text-sm font-bold">{formatCurrency(balances.totalBalance)}</p>
              </div>
            </div>

            {/* Colonne droite : Long/Short Ratio */}
            <Card className="p-4 h-full">
              <div className="flex flex-col h-full">
                {/* Section 1: Volumes */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-stat-label">Volume</p>
                    <PeriodSelector
                      selected={volumeTimeframe}
                      onChange={setVolumeTimeframe}
                      options={['24h', '7d', '30d', 'all'] as const}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-text-secondary text-xs">Perp:</p>
                      <p className="text-text-primary text-sm font-bold">{formatCurrency(volumeData.perpVolume)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-text-secondary text-xs">Spot + Vault:</p>
                      <p className="text-text-primary text-sm font-bold">{formatCurrency(volumeData.spotVaultVolume)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-text-secondary text-xs">Total:</p>
                      <p className="text-text-primary text-sm font-bold">{formatCurrency(volumeData.totalVolume)}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Long/Short Ratio */}
                <div className="space-y-2 pt-3 border-t border-border-subtle mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-success text-xs font-medium">
                      Long: {formatAbbreviated(longShortData.longValue)}
                    </span>
                    <span className="text-danger text-xs font-medium">
                      Short: {formatAbbreviated(longShortData.shortValue)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden relative">
                      {longShortData.totalValue > 0 && (
                        <>
                          {/* Long positions bar */}
                          <div
                            className="h-full bg-success transition-all duration-500 absolute left-0"
                            style={{
                              width: `${longShortData.longPercentage}%`
                            }}
                          />
                          {/* Short positions bar */}
                          <div
                            className="h-full bg-danger transition-all duration-500 absolute right-0"
                            style={{
                              width: `${100 - longShortData.longPercentage}%`
                            }}
                          />
                        </>
                      )}
                    </div>
                    <div className="flex justify-between text-label text-text-tertiary">
                      <span>{longShortData.longPercentage.toFixed(1)}% Long</span>
                      <span>{(100 - longShortData.longPercentage).toFixed(1)}% Short</span>
                    </div>
                  </div>

                  {/* Withdrawable */}
                  <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                    <p className="text-text-secondary text-xs">Withdrawable:</p>
                    <p className="text-text-primary text-sm font-bold">{formatCurrency(0)}</p>
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
