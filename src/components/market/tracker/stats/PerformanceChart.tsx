"use client";

import { useState } from "react";
import { PerformanceSection } from "./performance/PerformanceSection";
import { NetWorthSection } from "./performance/NetWorthSection";
import { DistributionSection, type DistributionMode } from "./performance/DistributionSection";
import { usePortfolioHistory } from "@/services/market/tracker/hyperfolio";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { PortfolioApiResponse } from "@/services/explorer/address/types";
import { HyperliquidBalance } from "@/services/market/tracker/types";

type PerformanceTab = 'performance' | 'networth' | 'distribution';

interface PerformanceChartProps {
  /** Wallet address — enables the Hyperfolio net-worth history when snapshots exist. */
  address?: string;
  portfolioData?: PortfolioApiResponse | null;
  portfolioLoading?: boolean;
  spotBalances?: HyperliquidBalance[];
  balancesLoading?: boolean;
}

export function PerformanceChart({
  address = "",
  portfolioData,
  portfolioLoading = false,
  spotBalances = [],
  balancesLoading = false
}: PerformanceChartProps) {
  const [activeTab, setActiveTab] = useState<PerformanceTab>('performance');
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  const [distributionMode, setDistributionMode] = useState<DistributionMode>('spot');

  // Hyperfolio daily net-worth snapshots — only wallets tracked there have any;
  // the tab and the category/protocol splits stay hidden otherwise.
  const { history, isLoading: historyLoading } = usePortfolioHistory(address, 365);

  const tabs: { value: PerformanceTab; label: string }[] = [
    { value: 'performance', label: 'Performance' },
    ...(history ? [{ value: 'networth' as const, label: 'Net worth' }] : []),
    { value: 'distribution', label: 'Distribution' }
  ];

  const distributionModes: { value: DistributionMode; label: string }[] = [
    { value: 'spot', label: 'Spot' },
    { value: 'category', label: 'Category' },
    { value: 'protocol', label: 'Protocol' },
  ];

  return (
    <Card className="w-full h-full relative">
      {/* Aurora pill tabs */}
      <div className="absolute top-3 left-4 z-20">
        <PillTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as PerformanceTab)}
        />
      </div>

      {/* Hide small balances — only on Distribution, Aurora style */}
      {activeTab === 'distribution' && (
        <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
          {history && (
            <PillTabs
              variant="text"
              tabs={distributionModes}
              activeTab={distributionMode}
              onTabChange={(value) => setDistributionMode(value as DistributionMode)}
            />
          )}
          <button
            onClick={() => setHideSmallBalances(!hideSmallBalances)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              hideSmallBalances
                ? "border-brand/40 bg-brand/10 text-brand"
                : "border-border-subtle bg-base text-text-secondary hover:text-text-primary hover:border-border-default"
            }`}
            title={hideSmallBalances ? "Show all balances" : "Hide balances under $1"}
          >
            {hideSmallBalances ? <EyeOff size={12} /> : <Eye size={12} />}
            <span className="hidden sm:inline">Hide dust</span>
          </button>
        </div>
      )}

      {activeTab === 'performance' && (
        <PerformanceSection
          portfolioData={portfolioData}
          isLoading={portfolioLoading}
        />
      )}
      {activeTab === 'networth' && (
        <NetWorthSection history={history} isLoading={historyLoading} />
      )}
      {activeTab === 'distribution' && (
        <DistributionSection
          hideSmallBalances={hideSmallBalances}
          spotBalances={spotBalances}
          isLoading={balancesLoading}
          mode={history ? distributionMode : 'spot'}
          history={history}
        />
      )}
    </Card>
  );
}
