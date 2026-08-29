import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";
import type { WalletRoundTrip } from "@/services/market/tracker/wallet-performance";

interface IndexerEnvelope<T> {
  success: boolean;
  data: T;
}

/** Market-wide biggest round-trip = a completed trade, so it reuses the shape. */
export type MarketTrade = WalletRoundTrip;

/**
 * Market-wide biggest closed round-trip trades, ranked by realized PnL. Passing
 * DESC surfaces the biggest wins, ASC the biggest losses. The backend assembles
 * and ranks the trades; the front only formats them.
 */
export const fetchBiggestTrades = async (
  sortDir: "DESC" | "ASC" = "DESC",
  limit = 5
): Promise<MarketTrade[]> => {
  return withErrorHandling(async () => {
    const res = await get<IndexerEnvelope<MarketTrade[]>>(`/indexer/completed-trades/`, {
      sort_by: "pnl_realized",
      sort_dir: sortDir,
      limit,
    });
    return res.data ?? [];
  }, "fetching biggest trades");
};

export const useBiggestTrades = (sortDir: "DESC" | "ASC" = "DESC", limit = 5) => {
  const { data, isLoading, error, refetch } = useDataFetching<MarketTrade[]>({
    fetchFn: () => fetchBiggestTrades(sortDir, limit),
    dependencies: [sortDir, limit],
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { trades: data ?? [], isLoading, error, refetch };
};
