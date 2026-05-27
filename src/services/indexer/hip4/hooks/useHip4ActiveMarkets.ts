import { useMemo } from "react";
import { useHip4QuestionsWithOutcomes } from "./useHip4QuestionsWithOutcomes";
import type { Hip4QuestionWithOutcomesRow } from "../types";

export interface UseHip4ActiveMarketsResult {
  questions: Hip4QuestionWithOutcomesRow[];
  totalVolume: number;
  activeCount: number;
  isLoading: boolean;
  error: Error | null;
  dataUpdatedAt: number | null;
  refetch: () => void;
}

/**
 * useHip4ActiveMarkets — top N open HIP-4 markets sorted by volume.
 *
 * Filters `status === "live"` then sorts descending by `total_volume`.
 * Also returns the cumulative volume and the total count of active markets
 * (useful for card-head tags).
 */
export function useHip4ActiveMarkets(limit = 5): UseHip4ActiveMarketsResult {
  const { questions, isLoading, error, dataUpdatedAt, refetch } = useHip4QuestionsWithOutcomes({
    limit: 200,
  });

  const { topQuestions, totalVolume, activeCount } = useMemo(() => {
    const live = questions.filter((q) => q.status === "live");
    const sorted = [...live].sort(
      (a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0)
    );
    const sum = live.reduce((acc, q) => acc + (q.total_volume ?? 0), 0);
    return {
      topQuestions: sorted.slice(0, limit),
      totalVolume: sum,
      activeCount: live.length,
    };
  }, [questions, limit]);

  return {
    questions: topQuestions,
    totalVolume,
    activeCount,
    isLoading,
    error,
    dataUpdatedAt,
    refetch,
  };
}
