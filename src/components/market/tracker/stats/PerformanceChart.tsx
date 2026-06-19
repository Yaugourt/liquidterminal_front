"use client";

import { useState } from "react";
import { PerformanceSection } from "./performance/PerformanceSection";
import { DistributionSection } from "./performance/DistributionSection";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { PortfolioApiResponse } from "@/services/explorer/address/types";
import { HyperliquidBalance } from "@/services/market/tracker/types";

type PerformanceTab = 'performance' | 'distribution';

interface PerformanceChartProps {
  portfolioData?: PortfolioApiResponse | null;
  portfolioLoading?: boolean;
  spotBalances?: HyperliquidBalance[];
  balancesLoading?: boolean;
}

export function PerformanceChart({
  portfolioData,
  portfolioLoading = false,
  spotBalances = [],
  balancesLoading = false
}: PerformanceChartProps) {
  const [activeTab, setActiveTab] = useState<PerformanceTab>('performance');
  const [hideSmallBalances, setHideSmallBalances] = useState(false);

  const tabs: { value: PerformanceTab; label: string }[] = [
    { value: 'performance', label: 'Performance' },
    { value: 'distribution', label: 'Distribution' }
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
        <div className="absolute top-3 right-4 z-20">
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
      {activeTab === 'distribution' && (
        <DistributionSection
          hideSmallBalances={hideSmallBalances}
          spotBalances={spotBalances}
          isLoading={balancesLoading}
        />
      )}
    </Card>
  );
}
