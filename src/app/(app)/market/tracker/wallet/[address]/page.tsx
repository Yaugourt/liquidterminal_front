"use client";

import { useState, useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PortfolioStats, PerformanceChart } from "@/components/market/tracker/stats";
import { AssetsSection } from "@/components/market/tracker/assets";
import { WalletAssetsNavigation } from "@/components/market/tracker/WalletAssetsNavigation";
import { OrdersSection, TwapSection } from "@/components/explorer/address/orders";
import { WalletRecentFillsSection } from "@/components/market/tracker";
import { AddToTrackListButton } from "@/components/market/tracker/AddToTrackListButton";
import { usePortfolio } from "@/services/explorer/address/hooks/usePortfolio";
import { useWalletsBalances } from "@/services/market/tracker/hooks/useWalletsBalances";
import { Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicWalletViewProps {
  params: {
    address: string;
  };
}

/**
 * Public wallet view page - accessible without authentication
 * Shows full wallet data with "Add to Track List" button
 */
export default function PublicWalletView({ params }: PublicWalletViewProps) {
  const { address } = params;
  const { setTitle } = usePageTitle();
  const [activeAssetsTab, setActiveAssetsTab] = useState("holdings");
  const [copied, setCopied] = useState(false);

  // Validate address format
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);

  // Fetch wallet data (public APIs, no auth needed)
  const { data: portfolioData, isLoading: portfolioLoading, error: portfolioError } = usePortfolio(address);
  const { spotBalances, perpPositions, isLoading: balancesLoading, error: balancesError } = useWalletsBalances(address);

  useEffect(() => {
    setTitle(`Wallet ${address.slice(0, 6)}...${address.slice(-4)}`);
  }, [setTitle, address]);

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Invalid address
  if (!isValidAddress) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Invalid Wallet Address</h2>
          <p className="text-text-secondary mb-4">
            The wallet address &quot;{address}&quot; is not a valid Ethereum address.
          </p>
          <Button onClick={() => window.history.back()} className="bg-brand-accent hover:bg-brand-accent/90 text-black">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (portfolioLoading || balancesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
          <span className="text-text-muted text-sm">Loading wallet data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (portfolioError || balancesError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-6 max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-rose-400 text-sm mb-4">
            {portfolioError?.message || balancesError?.message || "Failed to load wallet data"}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty wallet
  const isEmpty = !spotBalances?.length && !perpPositions?.assetPositions?.length;

  return (
    <div className="space-y-8">
      {/* Header with address + CTA */}
      <div className="flex items-center justify-between glass-panel rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">Wallet:</span>
          <span className="font-mono text-white text-sm">{address}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAddress}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-text-muted hover:text-white" />
            )}
          </Button>
        </div>
        <AddToTrackListButton address={address} />
      </div>

      {/* Empty wallet message */}
      {isEmpty && (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Empty Wallet</h3>
          <p className="text-text-secondary">
            This wallet has no spot balances or perpetual positions.
          </p>
        </div>
      )}

      {/* Wallet data */}
      {!isEmpty && (
        <>
          {/* Stats + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-5">
              <PortfolioStats
                portfolioData={portfolioData}
                perpPositions={perpPositions}
                walletAddress={address}
              />
            </div>
            <div className="lg:col-span-7">
              <PerformanceChart
                portfolioData={portfolioData}
                portfolioLoading={portfolioLoading}
                spotBalances={spotBalances}
                balancesLoading={balancesLoading}
              />
            </div>
          </div>

          {/* Navigation */}
          <WalletAssetsNavigation
            activeTab={activeAssetsTab}
            onChange={setActiveAssetsTab}
          />

          {/* Content based on tab */}
          {activeAssetsTab === "holdings" && <AssetsSection addressOverride={address} />}

          {activeAssetsTab === "orders" && <OrdersSection address={address} />}

          {activeAssetsTab === "twap" && <TwapSection address={address} />}

          {activeAssetsTab === "recent-fills" && <WalletRecentFillsSection address={address} />}
        </>
      )}
    </div>
  );
}
