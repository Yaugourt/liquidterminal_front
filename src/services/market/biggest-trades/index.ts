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
 * DESC surfaces the biggest wins, ASC the biggest losses. `sinceHours` bounds
 * the window explicitly (sent as `start_time`); omitted, the backend default
 * applies. The backend assembles and ranks the trades; the front only formats.
 */
export const fetchBiggestTrades = async (
  sortDir: "DESC" | "ASC" = "DESC",
  limit = 5,
  sinceHours?: number
): Promise<MarketTrade[]> => {
  return withErrorHandling(async () => {
    const params: Record<string, string | number> = {
      sort_by: "pnl_realized",
      sort_dir: sortDir,
      limit,
    };
    if (sinceHours) params.start_time = new Date(Date.now() - sinceHours * 3_600_000).toISOString();
    const res = await get<IndexerEnvelope<MarketTrade[]>>(`/indexer/completed-trades/`, params);
    return res.data ?? [];
  }, "fetching biggest trades");
};

export const useBiggestTrades = (sortDir: "DESC" | "ASC" = "DESC", limit = 5, sinceHours?: number) => {
  const { data, isLoading, error, refetch } = useDataFetching<MarketTrade[]>({
    fetchFn: () => fetchBiggestTrades(sortDir, limit, sinceHours),
    dependencies: [sortDir, limit, sinceHours],
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { trades: data ?? [], isLoading, error, refetch };
};
