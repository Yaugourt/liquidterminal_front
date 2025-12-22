"use client";

import { useState } from "react";
import { AssetsTable } from "./AssetsTable";
import { useNumberFormat } from '@/store/number-format.store';
import { formatAssetValue, formatAssetTokenAmount, formatAssetPercent } from '@/lib/formatters/numberFormatting';
// import { ErrorCard } from './components'; // Inlined
import { AlertCircle } from "lucide-react";
import { useWalletData } from './hooks/useWalletData';
import { useHoldingsConverter } from './hooks/useHoldingsConverter';
import { useSortableData } from '@/hooks/useSortableData';
import { SortableHolding } from "@/components/types/wallet.types";
import { SortKey } from "./TableHeader";

interface AssetsSectionProps {
  initialViewType?: "spot" | "perp";
  addressOverride?: string;
}

export function AssetsSection({ initialViewType = "spot", addressOverride }: AssetsSectionProps) {
  const [viewType, setViewType] = useState<"spot" | "perp">(initialViewType);
  const { format } = useNumberFormat();

  const {
    walletAddress,
    activeWalletDisplay,
    spotBalances,
    perpPositions,
    spotMarketTokens,
    perpMarketTokens,
    isLoading,
    isSpotMarketLoading,
    isPerpMarketLoading,
    isRefreshing,
    isMounted,
    error,
    handleRefresh
  } = useWalletData({ addressOverride });

  const { convertedHoldings } = useHoldingsConverter({
    viewType,
    spotBalances,
    perpPositions,
    spotMarketTokens,
    perpMarketTokens,
    isMounted
  });

  const defaultSortKey = viewType === 'perp' ? 'unrealizedPnl' : 'totalValue';
  const { items: sortedHoldings, requestSort, sortConfig } = useSortableData<SortableHolding>(
    convertedHoldings as SortableHolding[],
    { key: defaultSortKey as SortKey, direction: 'desc' }
  );

  if (!isMounted) {
    return null;
  }

  if (!walletAddress) {
    return (
      <div className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center text-text-secondary space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Please select a wallet to view your assets</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center text-rose-400 space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error.message || "Une erreur est survenue lors du chargement des assets"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AssetsTable
        holdings={sortedHoldings}
        isLoading={isLoading || isSpotMarketLoading || isPerpMarketLoading}
        type={viewType}
        onSort={requestSort}
        activeSortKey={sortConfig.key as SortKey}
        sortDirection={sortConfig.direction}
        formatCurrency={(value) => formatAssetValue(Number(value), format)}
        formatTokenAmount={(value) => formatAssetTokenAmount(Number(value), format)}
        formatPercent={(value) => formatAssetPercent(value, format)}
        onViewTypeChange={setViewType}
        totalAssets={sortedHoldings.length}
        walletDisplay={activeWalletDisplay}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
