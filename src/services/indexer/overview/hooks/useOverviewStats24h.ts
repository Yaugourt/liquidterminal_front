import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip3Overview } from "@/services/indexer/hip3/api";
import type { Hip3Overview } from "@/services/indexer/hip3/types";

export function useOverviewStats24h(): {
  overview: Hip3Overview | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, error, refetch } = useDataFetching<Hip3Overview>({
    fetchFn: fetchHip3Overview,
    dependencies: [],
    refreshInterval: 60_000,
    maxRetries: 3,
  });

  return { overview: data ?? null, isLoading, error, refetch };
}
