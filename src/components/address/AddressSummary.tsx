"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { AddressCards } from "@/components/explorer/address/cards/AddressCards";
import { PortfolioStats } from "@/components/market/tracker/stats/PortfolioStats";
import { PerformanceChart } from "@/components/market/tracker/stats/PerformanceChart";
import { usePortfolio } from "@/services/explorer/address/hooks/usePortfolio";
import { useTransactions } from "@/services/explorer/address";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";

export type AddressSummaryVariant = "explorer" | "tracker";

interface AddressSummaryProps {
  address: string;
  /**
   * Controls the summary layout.
   * - `explorer` (default): 3 stat cards (Overview / PnL / More Info), no chart.
   *   Emphasises on-chain balances + activity dates.
   * - `tracker`: PortfolioStats (left 5/12) + PerformanceChart (right 7/12).
   *   Emphasises trading performance, volumes, and long/short exposure.
   */
  variant?: AddressSummaryVariant;
}

/**
 * Unified summary row for the address analytics page.
 * Picks a layout variant based on product intent:
 * - Explorer routes focus on on-chain data → the 3-card grid.
 * - Tracker routes focus on trading performance → stats + chart.
 */
export function AddressSummary({
  address,
  variant = "explorer",
}: AddressSummaryProps) {
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolio(address);
  const { transactions, isLoading: loadingTransactions } = useTransactions(address);
  const {
    spotBalances,
    perpPositions,
    isLoading: loadingBalances,
  } = useWalletsBalances(address);

  const handleInfoAddClick = useCallback(() => {
    toast.info("Private name tags are coming soon");
  }, []);

  if (variant === "tracker") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5">
          <PortfolioStats
            portfolioData={portfolio}
            perpPositions={perpPositions}
            walletAddress={address}
          />
        </div>
        <div className="lg:col-span-7">
          <PerformanceChart
            portfolioData={portfolio}
            portfolioLoading={loadingPortfolio}
            spotBalances={spotBalances}
            balancesLoading={loadingBalances}
          />
        </div>
      </div>
    );
  }

  return (
    <AddressCards
      portfolio={portfolio || []}
      loadingPortfolio={loadingPortfolio}
      onAddClick={handleInfoAddClick}
      address={address}
      transactions={transactions}
      isLoadingTransactions={loadingTransactions}
    />
  );
}
