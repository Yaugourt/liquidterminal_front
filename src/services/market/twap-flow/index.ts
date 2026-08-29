import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";

interface IndexerEnvelope<T> {
  success: boolean;
  data: T;
}

export interface TwapFlow {
  twapId: number;
  coin: string;
  user: string;
  /** "B" = buy, "A" = sell (Hyperliquid convention). */
  side: string;
  sz: number;
  executedSz: number;
  /** USD notional executed so far. */
  executedNtl: number;
  minutes: number;
  status: string;
  startTime: string;
}

const NTL_FLOOR = 5_000;

/**
 * Biggest TWAP executions over the last 24h, ranked by executed notional — the
 * largest sliced accumulation / distribution orders on Hyperliquid. The backend
 * serves the raw TWAP list; ranking to the top flows is a cheap client sort
 * (fresh TWAPs with no fills yet drop out under the notional floor).
 */
export const fetchTwapFlow = async (limit = 6): Promise<TwapFlow[]> => {
  return withErrorHandling(async () => {
    const res = await get<IndexerEnvelope<TwapFlow[]>>(`/indexer/twaps`, {
      limit: 150,
      hours: 24,
    });
    const rows = res.data ?? [];
    return rows
      .filter((t) => (t.executedNtl ?? 0) >= NTL_FLOOR)
      .sort((a, b) => (b.executedNtl ?? 0) - (a.executedNtl ?? 0))
      .slice(0, limit);
  }, "fetching twap flow");
};

export const useTwapFlow = (limit = 6) => {
  const { data, isLoading, error, refetch } = useDataFetching<TwapFlow[]>({
    fetchFn: () => fetchTwapFlow(limit),
    dependencies: [limit],
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { twaps: data ?? [], isLoading, error, refetch };
};
