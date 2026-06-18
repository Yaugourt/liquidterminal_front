"use client";

import { useMemo } from "react";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNumberFormat } from '@/store/number-format.store';
import { formatAssetValue } from '@/lib/formatters/numberFormatting';
import { HyperliquidBalance } from "@/services/market/tracker/types";
import { ChartLoading, ChartEmpty, chartPalette } from "@/components/common";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AssetDistribution;
  }>;
}

// Donut palette — anchored on the official chartPalette multi-series colors
// (see src/components/common/charts/chartTheme.ts).
const COLORS = chartPalette.multiSeries;

interface AssetDistribution {
  name: string;
  value: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

interface DistributionSectionProps {
  hideSmallBalances?: boolean;
  spotBalances?: HyperliquidBalance[];
  isLoading?: boolean;
}

export function DistributionSection({
  hideSmallBalances = false,
  spotBalances = [],
  isLoading: balancesLoading = false
}: DistributionSectionProps) {
  const { data: spotMarketTokens, isLoading: tokensLoading } = useSpotTokens({ limit: 100 });
  const { format } = useNumberFormat();

  const isLoading = balancesLoading || tokensLoading;

  const MIN_VALUE_THRESHOLD = 1;

  const distributionData = useMemo((): AssetDistribution[] => {
    if (!spotBalances || !spotMarketTokens || spotBalances.length === 0) {
      return [];
    }

    const assetValues = spotBalances.map((balance) => {
      const normalizedCoin = balance.coin.toLowerCase();
      const stablecoins = ['usdc', 'usdt', 'dai', 'busd', 'tusd'];
      const isStablecoin = stablecoins.includes(normalizedCoin);

      let price = 0;
      if (isStablecoin) {
        price = 1;
      } else {
        const marketToken = spotMarketTokens.find(t => t.name.toLowerCase() === normalizedCoin);
        price = marketToken ? marketToken.price : 0;
      }

      const value = parseFloat(balance.total) * price;

      return {
        name: balance.coin.toUpperCase(),
        value,
        balance: parseFloat(balance.total)
      };
    }).filter(asset => {
      if (asset.value <= 0) return false;
      if (hideSmallBalances && asset.value < MIN_VALUE_THRESHOLD) return false;
      return true;
    });

    const totalValue = assetValues.reduce((sum, asset) => sum + asset.value, 0);
    if (totalValue === 0) return [];

    const sortedAssets = assetValues
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return sortedAssets.map((asset, index) => ({
      name: asset.name,
      value: asset.value,
      percentage: (asset.value / totalValue) * 100,
      color: COLORS[index % COLORS.length]
    }));
  }, [spotBalances, spotMarketTokens, hideSmallBalances]);

  const totalPortfolio = useMemo(
    () => distributionData.reduce((sum, a) => sum + a.value, 0),
    [distributionData]
  );

  const formatCurrency = (value: number) => formatAssetValue(value, format);

  if (isLoading) {
    return (
      <div className="absolute inset-0 p-4 pt-12">
        <ChartLoading />
      </div>
    );
  }

  if (distributionData.length === 0) {
    return (
      <div className="absolute inset-0 p-4 pt-12">
        <ChartEmpty message="No spot assets available" />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[150px]">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: data.color,
                boxShadow: `0 0 8px ${data.color}66`,
              }}
            />
            <span>{data.name}</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-text-primary tabular-nums">
              {data.percentage.toFixed(1)}%
            </span>
            <span className="text-[11px] text-text-secondary tabular-nums">
              {formatCurrency(data.value)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Ambient glow — subtle cyan anchor */}
      <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-brand/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-gold/[0.05] blur-3xl" />

      <div className="absolute inset-0 p-4 pt-12 z-10">
        <div className="flex h-full">
          {/* Donut with centered total */}
          <div className="flex-1 pr-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="70%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="rgba(11,14,20,0.8)"
                  strokeWidth={2}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Centered metric */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                Total
              </span>
              <span className="text-sm font-semibold text-text-primary tabular-nums mt-0.5">
                {formatCurrency(totalPortfolio)}
              </span>
            </div>
          </div>

          {/* Asset list */}
          <div className="flex-1 pl-4">
            <div className="h-full flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-1.5 max-h-full">
                {distributionData.map((asset) => (
                  <div
                    key={asset.name}
                    className="flex items-center gap-2 rounded-md p-1.5 hover:bg-surface-2 transition-colors"
                  >
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{
                        background: asset.color,
                        boxShadow: `0 0 6px ${asset.color}66`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary text-xs font-semibold truncate">
                          {asset.name}
                        </span>
                        <span className="text-text-primary text-xs font-semibold ml-1 tabular-nums">
                          {asset.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-text-tertiary text-[11px] truncate tabular-nums">
                        {formatCurrency(asset.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
