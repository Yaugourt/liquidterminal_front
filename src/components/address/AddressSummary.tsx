"use client";

import { PortfolioStats } from "@/components/market/tracker/stats/PortfolioStats";
import { PerformanceChart } from "@/components/market/tracker/stats/PerformanceChart";
import { usePortfolio } from "@/services/explorer/address/hooks/usePortfolio";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { AddressDigest } from "./digest";

export type AddressSummaryVariant = "explorer" | "tracker";

interface AddressSummaryProps {
  address: string;
  /**
   * Controls the summary layout.
   * - `explorer` (default): KPI ribbon + wallet-profile card (`AddressDigest`).
   *   One strip of headline figures, one card that crosses balances, markets,
   *   edge and risk — keeps the transactions table within the first screen.
   * - `tracker`: PortfolioStats (left 5/12) + PerformanceChart (right 7/12).
   *   Emphasises trading performance, volumes, and long/short exposure.
   */
  variant?: AddressSummaryVariant;
}

/**
 * Unified summary row for the address analytics page.
 * Picks a layout variant based on product intent:
 * - Explorer routes focus on on-chain data → the digest.
 * - Tracker routes focus on trading performance → stats + chart.
 */
export function AddressSummary({
  address,
  variant = "explorer",
}: AddressSummaryProps) {
  if (variant === "tracker") {
    return <TrackerSummary address={address} />;
  }
  return <AddressDigest address={address} />;
}

function TrackerSummary({ address }: { address: string }) {
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolio(address);
  const {
    spotBalances,
    perpPositions,
    isLoading: loadingBalances,
  } = useWalletsBalances(address);

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
          address={address}
          portfolioData={portfolio}
          portfolioLoading={loadingPortfolio}
          spotBalances={spotBalances}
          balancesLoading={loadingBalances}
        />
      </div>
    </div>
  );
}
