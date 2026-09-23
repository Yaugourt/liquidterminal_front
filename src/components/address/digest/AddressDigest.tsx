"use client";

import type { ReactNode } from "react";
import { PerformanceChart } from "@/components/market/tracker/stats/PerformanceChart";
import { AddressKpiRibbon } from "./AddressKpiRibbon";
import { WalletProfileCard } from "./WalletProfileCard";
import { WalletInsightsCard } from "./WalletInsights";
import { useAddressDigest, type DigestVariant } from "./useAddressDigest";

interface AddressDigestProps {
  address: string;
  /**
   * - `explorer` (default): ribbon + insights, then the tabs.
   * - `tracker`: ribbon, then the performance chart beside the insights,
   *   then the tabs. HyperEVM balances are folded into the model.
   */
  variant?: DigestVariant;
  /** The tab bar + panels (holdings, transactions…), rendered at the bottom
   *  of the page, after the detailed profile. */
  children: ReactNode;
  /** Opens the Holdings tab on the perp view (from the profile's Risk column). */
  onShowPositions?: () => void;
}

/**
 * Address page body, in reading order: headline figures (KPI ribbon), the
 * cross-feed findings (+ the performance chart on the tracker), the detailed
 * profile grid, then what the wallet holds and does (the tabs, passed as
 * children) at the bottom. `useAddressDigest` opens every feed once, so the chart and the
 * profile reuse the same portfolio, balance and ledger responses.
 */
export function AddressDigest({ address, variant = "explorer", children, onShowPositions }: AddressDigestProps) {
  const model = useAddressDigest(address, variant);
  const insightsLoading = model.isLoading || model.tradingLoading;
  // Explorer: an on-chain-only address with nothing to cross gets no card.
  const showInsights = model.insights.length > 0 || insightsLoading;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <AddressKpiRibbon model={model} />
        {variant === "tracker" ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
            <div className="h-[300px] min-w-0">
              <PerformanceChart
                address={address}
                portfolioData={model.raw.portfolio}
                portfolioLoading={model.raw.portfolioLoading}
                spotBalances={model.raw.spotBalances}
                balancesLoading={model.raw.balancesLoading}
              />
            </div>
            <WalletInsightsCard insights={model.insights} loading={insightsLoading} className="min-w-0 xl:h-[300px]" />
          </div>
        ) : (
          showInsights && <WalletInsightsCard insights={model.insights} loading={insightsLoading} />
        )}
      </div>

      <WalletProfileCard model={model} onShowPositions={onShowPositions} />

      {children}
    </div>
  );
}
