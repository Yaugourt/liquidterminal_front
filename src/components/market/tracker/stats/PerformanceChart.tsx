"use client";

import { useState } from "react";
import { PerformanceSection } from "./performance/PerformanceSection";
import { DistributionSection } from "./performance/DistributionSection";
import { Eye, EyeOff } from "lucide-react";
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

  return (
    <div className="w-full h-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden relative">

      {/* Tab Buttons Inlined */}
      <div className="absolute top-3 left-4 z-10">
        <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
          {[
            { key: 'performance', label: 'Performance' },
            { key: 'distribution', label: 'Distribution' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "performance" | "distribution")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.key
                ? 'bg-brand-accent text-brand-tertiary font-bold shadow-sm'
                : 'text-text-secondary hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hide small balances toggle - only visible on Distribution tab */}
      {activeTab === 'distribution' && (
        <div className="absolute top-3 right-4 z-10">
          <button
            onClick={() => setHideSmallBalances(!hideSmallBalances)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${hideSmallBalances
              ? 'bg-brand-accent/20 border-brand-accent/50 text-brand-accent'
              : 'bg-brand-tertiary border-border-subtle text-text-secondary hover:text-white hover:border-border-hover'
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
    </div>
  );
}
