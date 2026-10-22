"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import {
  useHip4QuestionsWithOutcomes,
  useHip4Fills,
  useHip4Settlements,
  useHip4LiveMarkets,
  useHip4Resolutions,
} from "@/services/indexer/hip4";
import {
  Hip4GlobalStatsStrip,
  Hip4AnalyticsChart,
  Hip4MarketGrid,
  Hip4RecentFills,
  Hip4SettlementsTable,
  Hip4StalenessChip,
} from "@/components/market/hip4";
import { PageHeader, PageFaq, SourceBadge, combinedSourceStatus } from "@/components/common";
import { buildMergedQuestions, withResolutions } from "@/lib/hip4/merge-questions";
import { rememberFillLabels } from "@/lib/hip4/fill-labels";
import { HIP4_FAQ } from "@/lib/page-faqs";

export default function MarketHip4Page() {
  const { setTitle } = usePageTitle();

  const questions = useHip4QuestionsWithOutcomes({ limit: 200 });
  const fills = useHip4Fills({ limit: 50 });
  const settlements = useHip4Settlements({ limit: 50 });
  // Live markets HypeDexer's aggregation tables omit (Fed/NBA/CPI/recurring BTC),
  // sourced straight from Hyperliquid's outcomeMeta + allMids.
  const live = useHip4LiveMarkets();
  // How the markets that no longer trade ended (last trades, winners).
  const resolutions = useHip4Resolutions();

  useEffect(() => {
    setTitle("HIP-4 - Market");
  }, [setTitle]);

  // The tape trades the live markets: they name its fills, and keep naming a
  // market's last fills once Hyperliquid delists it.
  const marketIndex = useMemo(
    () => rememberFillLabels(live.liveMarketsByCoin),
    [live.liveMarketsByCoin]
  );

  // Merge HypeDexer's questions with the canonical Hyperliquid live markets
  // (drop ghosts, enrich prices, hide the residual outcome, tag tradeable
  // coins), then add how the closed and settled ones ended. Shared with the
  // detail page — see merge-questions.ts.
  const mergedQuestions = useMemo(
    () =>
      withResolutions(
        buildMergedQuestions(questions.questions, {
          liveQuestions: live.liveQuestions,
          mids: live.mids,
          liveMarketsByCoin: live.liveMarketsByCoin,
        }),
        resolutions.coins
      ),
    [questions.questions, live.liveQuestions, live.mids, live.liveMarketsByCoin, resolutions.coins]
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="HIP-4 Prediction Markets"
        titleQualifier="on Hyperliquid"
        description="Live prediction markets on Hyperliquid — outcome probabilities grouped by question, volume, open interest, and settlements."
        actions={
          <div className="flex items-center gap-2">
            <SourceBadge
              source="hypedexer"
              status={combinedSourceStatus(questions, fills, settlements)}
            />
            <Hip4StalenessChip updatedAt={questions.dataUpdatedAt} />
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              Mainnet
            </span>
          </div>
        }
      />

      <Hip4GlobalStatsStrip
        questions={mergedQuestions}
        settlements={settlements.settlements}
        isLoading={questions.isLoading && live.isLoading}
        volumesPartial={live.volumesPartial}
      />

      <Hip4AnalyticsChart />

      <Hip4MarketGrid
        questions={mergedQuestions}
        isLoading={questions.isLoading && live.isLoading}
        settlementsCount={settlements.settlements.length}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Hip4RecentFills
          fills={fills.fills}
          isLoading={fills.isLoading}
          marketIndex={marketIndex}
        />
        <Hip4SettlementsTable
          settlements={settlements.settlements}
          isLoading={settlements.isLoading}
        />
      </div>
      <PageFaq items={HIP4_FAQ} />
    </motion.div>
  );
}
