"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import { useHip4Markets, useHip4Questions, useHip4Fills, useHip4Settlements } from "@/services/indexer/hip4";
import { Button } from "@/components/ui/button";
import {
  Hip4GlobalStatsStrip,
  Hip4MarketShareChart,
  Hip4MarketsFlowChart,
  Hip4MarketsTable,
  Hip4RecentFills,
  Hip4SettlementsTable,
} from "@/components/market/hip4";

export default function MarketHip4Page() {
  const { setTitle } = usePageTitle();

  const markets = useHip4Markets({ limit: 200 });
  const questions = useHip4Questions({ limit: 100 });
  const fills = useHip4Fills({ limit: 50 });
  const settlements = useHip4Settlements({ limit: 50 });

  useEffect(() => {
    setTitle("HIP-4 - Market");
  }, [setTitle]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">HIP-4 Prediction Markets</h1>
          <p className="text-text-secondary text-sm mt-1 max-w-2xl">
            Live binary prediction markets on HyperLiquid — outcome probabilities, volume, open interest, and market resolutions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2.5 py-1 rounded-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold animate-pulse" />
            Testnet
          </span>
        </div>
      </div>

      {/* KPI strip */}
      <Hip4GlobalStatsStrip
        markets={markets.markets}
        questions={questions.questions}
        isLoading={markets.isLoading}
      />

      {/* Charts — market share donut + flow */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Hip4MarketShareChart
          markets={markets.markets}
          isLoading={markets.isLoading}
        />
        <Hip4MarketsFlowChart
          markets={markets.markets}
          isLoading={markets.isLoading}
        />
      </div>

      {/* Markets table */}
      <Hip4MarketsTable
        markets={markets.markets}
        isLoading={markets.isLoading}
        error={markets.error}
      />

      {/* Recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Hip4RecentFills
          fills={fills.fills}
          isLoading={fills.isLoading}
        />
        <Hip4SettlementsTable
          settlements={settlements.settlements}
          isLoading={settlements.isLoading}
        />
      </div>
    </motion.div>
  );
}
