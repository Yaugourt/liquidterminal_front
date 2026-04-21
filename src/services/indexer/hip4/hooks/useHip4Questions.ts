import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4Questions } from "../api";
import type { Hip4QuestionRow, Hip4QuestionsQuery, UseHip4QuestionsResult } from "../types";

export function useHip4Questions(params?: Hip4QuestionsQuery): UseHip4QuestionsResult {
  const { data, isLoading, error, refetch } = useDataFetching<Hip4QuestionRow[]>({
    fetchFn: () => fetchHip4Questions(params),
    refreshInterval: 60000,
    dependencies: [JSON.stringify(params)],
    maxRetries: 3,
  });

  return {
    questions: Array.isArray(data) ? data : [],
    isLoading,
    error,
    refetch,
  };
}
