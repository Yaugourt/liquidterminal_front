"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import {
  useHip4MarketsEnriched,
  useHip4QuestionsWithOutcomes,
  useHip4Fills,
  useHip4Settlements,
  useHip4LiveMarkets,
} from "@/services/indexer/hip4";
import {
  Hip4GlobalStatsStrip,
  Hip4AnalyticsChart,
  Hip4MarketGrid,
  Hip4RecentFills,
  Hip4SettlementsTable,
  Hip4StalenessChip,
} from "@/components/market/hip4";
import { PageHeader } from "@/components/common";
import { buildMergedQuestions } from "@/lib/hip4/merge-questions";

export default function MarketHip4Page() {
  const { setTitle } = usePageTitle();

  const enriched = useHip4MarketsEnriched({ limit: 500 });
  const questions = useHip4QuestionsWithOutcomes({ limit: 200 });
  const fills = useHip4Fills({ limit: 50 });
  const settlements = useHip4Settlements({ limit: 50 });
  // Live markets HypeDexer's aggregation tables omit (Fed/NBA/CPI/recurring BTC),
  // sourced straight from Hyperliquid's outcomeMeta + allMids.
  const live = useHip4LiveMarkets();

  useEffect(() => {
    setTitle("HIP-4 - Market");
  }, [setTitle]);

  const marketIndex = useMemo(() => {
    const idx: Record<string, { name: string; sideName: string | null; isBinary: boolean }> = {};
    const add = (m: { coin: string | null; short_name: string; display_name: string; side_name: string | null; side: number | null; parsed_sides: { name: string }[] | null }) => {
      if (!m.coin || idx[m.coin]) return;
      const isBinary = (m.parsed_sides?.length ?? 0) === 2;
      idx[m.coin] = {
        name: m.short_name || m.display_name,
        sideName: m.side_name ?? (isBinary && m.side != null ? m.parsed_sides?.[m.side]?.name ?? null : null),
        isBinary,
      };
    };
    for (const m of enriched.markets) add(m);
    // Label fills for the live coins too (they're absent from enriched).
    for (const m of Object.values(live.liveMarketsByCoin)) add(m);
    return idx;
  }, [enriched.markets, live.liveMarketsByCoin]);

  // Merge HypeDexer's questions with the canonical Hyperliquid live markets
  // (drop ghosts, enrich prices, hide the residual outcome, tag tradeable
  // coins). Shared with the detail page — see merge-questions.ts.
  const mergedQuestions = useMemo(
    () =>
      buildMergedQuestions(questions.questions, {
        liveQuestions: live.liveQuestions,
        mids: live.mids,
        liveMarketsByCoin: live.liveMarketsByCoin,
      }),
    [questions.questions, live.liveQuestions, live.mids, live.liveMarketsByCoin]
  );

  // Settlements come back with `question_name`/`coin` null on the freshest rows,
  // so they'd render as a bare `#136`. Resolve a readable title from the enriched
  // markets (keyed by outcome_id) as a fallback. Endpoint-provided names still
  // win so the already-correct rows never regress.
  const settlementTitleIndex = useMemo(() => {
    const idx: Record<number, string> = {};
    for (const m of enriched.markets) {
      if (m.outcome_id == null) continue;
      idx[m.outcome_id] = m.display_name || m.short_name || m.coin || `#${m.outcome_id}`;
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
      <PageHeader
        title="HIP-4 Prediction Markets"
        description="Live prediction markets on HyperLiquid — outcome probabilities grouped by question, volume, open interest, and settlements."
        actions={
          <div className="flex items-center gap-2">
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
        isLoading={(enriched.isLoading || questions.isLoading) && live.isLoading}
        volumesPartial={live.volumesUnavailable}
      />

      <Hip4AnalyticsChart />

      <Hip4MarketGrid
        questions={mergedQuestions}
        isLoading={questions.isLoading && live.isLoading}
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
          titleIndex={settlementTitleIndex}
        />
      </div>
    </motion.div>
  );
}
