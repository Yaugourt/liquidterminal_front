import { useCallback, useMemo } from "react";
import { useHip4QuestionsWithOutcomes } from "./useHip4QuestionsWithOutcomes";
import { useHip4LiveMarkets } from "./useHip4LiveMarkets";
import { buildMergedQuestions, liveQuestionsByVolume } from "@/lib/hip4/merge-questions";
import type { Hip4QuestionWithOutcomesRow } from "../types";

export interface UseHip4ActiveMarketsResult {
  questions: Hip4QuestionWithOutcomesRow[];
  totalVolume: number;
  activeCount: number;
  /** No volume is known (their first read failed): show none rather than
   * zeros. The order is then outcomeMeta's. */
  volumesMissing: boolean;
  isLoading: boolean;
  error: Error | null;
  /** The last refresh failed; the markets shown are the previous load. */
  isStale?: boolean;
  dataUpdatedAt: number | null;
  refetch: () => void;
}

const NO_QUESTIONS: Hip4QuestionWithOutcomesRow[] = [];

/**
 * useHip4ActiveMarkets — top N live HIP-4 markets by volume, as the list
 * page's Live pill sees them.
 *
 * The indexer's own `status` can't be trusted on its own: markets that
 * settled months ago still read "live", and the live ones are missing from
 * its lists. So the questions are merged with Hyperliquid's live markets
 * (outcomeMeta + allMids + volumes) exactly like `/market/hip4`, then kept on
 * `effectiveStatus`. Nothing is listed before outcomeMeta and the volumes
 * have answered: the indexer alone would bring back the stale markets, and a
 * list ranked before its volumes would reorder a moment later.
 *
 * Also returns the cumulative volume and the total count of live markets
 * (useful for card-head tags).
 */
export function useHip4ActiveMarkets(limit = 5): UseHip4ActiveMarketsResult {
  // Same params as the HIP-4 pages: one backend entry.
  const indexer = useHip4QuestionsWithOutcomes({ limit: 200 });
  const live = useHip4LiveMarkets();
  const ready = live.dataUpdatedAt !== null && live.volumesSettled;

  const { topQuestions, totalVolume, activeCount } = useMemo(() => {
    if (!ready) return { topQuestions: NO_QUESTIONS, totalVolume: 0, activeCount: 0 };
    const liveQuestions = liveQuestionsByVolume(
      buildMergedQuestions(indexer.questions, {
        liveQuestions: live.liveQuestions,
        mids: live.mids,
        liveMarketsByCoin: live.liveMarketsByCoin,
      })
    );
    return {
      topQuestions: liveQuestions.slice(0, limit),
      totalVolume: liveQuestions.reduce((acc, q) => acc + (q.total_volume ?? 0), 0),
      activeCount: liveQuestions.length,
    };
  }, [ready, indexer.questions, live.liveQuestions, live.mids, live.liveMarketsByCoin, limit]);

  const { refetch: refetchIndexer } = indexer;
  const { refetch: refetchLive } = live;
  const refetch = useCallback(() => {
    refetchIndexer();
    refetchLive();
  }, [refetchIndexer, refetchLive]);

  return {
    questions: topQuestions,
    totalVolume,
    activeCount,
    volumesMissing: ready && live.volumesMissing,
    isLoading: !ready && !live.failed,
    // Only the live markets decide what is listed: without them there is
    // nothing trustworthy to show, whatever the indexer answered.
    error: !ready && live.failed ? live.error : null,
    // A refresh failed somewhere (the rows are the last good ones), or some
    // volumes are missing, so the ranking and the total are understated.
    isStale: Boolean(live.isStale || indexer.isStale || indexer.error || (ready && live.volumesPartial)),
    dataUpdatedAt: live.dataUpdatedAt,
    refetch,
  };
}
