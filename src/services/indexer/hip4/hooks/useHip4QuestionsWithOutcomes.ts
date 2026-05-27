import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4QuestionsWithOutcomes } from "../api";
import type {
  Hip4QuestionWithOutcomesRow,
  Hip4QuestionsWithOutcomesQuery,
  UseHip4QuestionsWithOutcomesResult,
} from "../types";

export function useHip4QuestionsWithOutcomes(
  params?: Hip4QuestionsWithOutcomesQuery
): UseHip4QuestionsWithOutcomesResult {
  const { data, isLoading, error, dataUpdatedAt, refetch } = useDataFetching<Hip4QuestionWithOutcomesRow[]>({
    fetchFn: () => fetchHip4QuestionsWithOutcomes(params),
    refreshInterval: 30000,
    dependencies: [JSON.stringify(params)],
    maxRetries: 3,
  });

  return {
    questions: Array.isArray(data) ? data : [],
    isLoading,
    error,
    dataUpdatedAt,
    refetch,
  };
}
