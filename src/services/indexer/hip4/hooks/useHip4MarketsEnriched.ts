import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4MarketsEnriched } from "../api";
import type {
  Hip4MarketEnrichedRow,
  Hip4MarketsEnrichedQuery,
  UseHip4MarketsEnrichedResult,
} from "../types";

export function useHip4MarketsEnriched(
  params?: Hip4MarketsEnrichedQuery
): UseHip4MarketsEnrichedResult {
  const { data, isLoading, error, refetch } = useDataFetching<Hip4MarketEnrichedRow[]>({
    fetchFn: () => fetchHip4MarketsEnriched(params),
    refreshInterval: 30000,
    dependencies: [JSON.stringify(params)],
    maxRetries: 3,
  });

  return {
    markets: Array.isArray(data) ? data : [],
    isLoading,
    error,
    refetch,
  };
}
