"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
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
  const uid = useId().replace(/:/g, "");

  const tabs: { key: PerformanceTab; label: string }[] = [
    { key: 'performance', label: 'Performance' },
    { key: 'distribution', label: 'Distribution' }
  ];

  return (
    <div className="w-full h-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden relative">
      {/* Aurora pill tabs */}
      <div className="absolute top-3 left-4 z-20">
        <div className="flex items-center rounded-xl border border-border-subtle bg-black/30 p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative rounded-lg px-3 py-1 text-[11px] font-semibold whitespace-nowrap"
              >
                {isActive && (
                  <motion.span
                    layoutId={`perf-tab-${uid}`}
                    className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    isActive ? "text-white" : "text-text-secondary hover:text-white"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hide small balances — only on Distribution, Aurora style */}
      {activeTab === 'distribution' && (
        <div className="absolute top-3 right-4 z-20">
          <button
            onClick={() => setHideSmallBalances(!hideSmallBalances)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              hideSmallBalances
                ? "border-brand-accent/40 bg-brand-accent/10 text-brand-accent"
                : "border-border-subtle bg-black/30 text-text-secondary hover:text-white hover:border-border-hover"
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
