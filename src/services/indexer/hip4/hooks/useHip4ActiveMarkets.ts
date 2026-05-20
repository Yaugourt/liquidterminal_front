import { useMemo } from "react";
import { useHip4QuestionsWithOutcomes } from "./useHip4QuestionsWithOutcomes";
import type { Hip4QuestionWithOutcomesRow } from "../types";

export interface UseHip4ActiveMarketsResult {
  questions: Hip4QuestionWithOutcomesRow[];
  totalVolume: number;
  activeCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * useHip4ActiveMarkets — top N marchés HIP-4 ouverts triés par volume.
 *
 * Filtre `status === "live"` puis tri décroissant sur `total_volume`.
 * Renvoie aussi le volume cumulé et le compte total de markets actifs
 * (utile pour les tags du card-head).
 */
export function useHip4ActiveMarkets(limit = 5): UseHip4ActiveMarketsResult {
  const { questions, isLoading, error, refetch } = useHip4QuestionsWithOutcomes({
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
    refetch,
  };
}
