"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import {
  useHip4MarketsEnriched,
  useHip4QuestionsWithOutcomes,
  useHip4Fills,
  useHip4Settlements,
} from "@/services/indexer/hip4";
import {
  Hip4GlobalStatsStrip,
  Hip4MarketShareChart,
  Hip4MarketsFlowChart,
  Hip4MarketGrid,
  Hip4RecentFills,
  Hip4SettlementsTable,
} from "@/components/market/hip4";

export default function MarketHip4Page() {
  const { setTitle } = usePageTitle();

  const enriched = useHip4MarketsEnriched({ limit: 500 });
  const questions = useHip4QuestionsWithOutcomes({ limit: 200 });
  const fills = useHip4Fills({ limit: 50 });
  const settlements = useHip4Settlements({ limit: 50 });

  useEffect(() => {
    setTitle("HIP-4 - Market");
  }, [setTitle]);

  const marketNameIndex = useMemo(() => {
    const idx: Record<string, string> = {};
    for (const m of enriched.markets) {
      if (m.coin) idx[m.coin] = m.display_name;
    }
    return idx;
  }, [enriched.markets]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">HIP-4 Prediction Markets</h1>
          <p className="text-text-secondary text-sm mt-1 max-w-2xl">
            Live prediction markets on HyperLiquid — outcome probabilities grouped by question, volume, open interest, and settlements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2.5 py-1 rounded-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold animate-pulse" />
            Testnet
          </span>
        </div>
      </div>

      <Hip4GlobalStatsStrip
        markets={enriched.markets}
        questions={questions.questions}
        isLoading={enriched.isLoading}
      />

      <Hip4MarketGrid
        questions={questions.questions}
        isLoading={questions.isLoading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Hip4MarketShareChart
          markets={enriched.markets}
          isLoading={enriched.isLoading}
        />
        <Hip4MarketsFlowChart
          markets={enriched.markets}
          isLoading={enriched.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Hip4RecentFills
          fills={fills.fills}
          isLoading={fills.isLoading}
          marketNameIndex={marketNameIndex}
        />
        <Hip4SettlementsTable
          settlements={settlements.settlements}
          isLoading={settlements.isLoading}
        />
      </div>
    </motion.div>
  );
}
