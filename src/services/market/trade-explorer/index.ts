import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";
import type { WalletRoundTrip } from "@/services/market/tracker/wallet-performance";

interface Envelope<T> {
  success: boolean;
  data: T;
}

export type TradeSortBy = "pnl_realized" | "total_volume" | "duration_s";
export type TradeSortDir = "DESC" | "ASC";

export interface TradeExplorerParams {
  coin?: string;
  sortBy: TradeSortBy;
  sortDir: TradeSortDir;
  limit?: number;
}

/** All-time completed-trades summary, for the explorer context ribbon. */
export interface TradeSummary {
  total_trades: number;
  total_pnl: number;
  total_volume: number;
  total_fees: number;
  direction_breakdown: Array<{ direction: string; count: number; total_pnl: number }>;
}

/**
 * Market-wide closed round-trip trades (entry to exit), filterable by coin and
 * sortable by realized PnL, volume or hold time. Assembled server-side; the
 * front only formats. Only-here: a searchable market-wide trade explorer.
 */
export const fetchTradeExplorer = async (
  params: TradeExplorerParams
): Promise<WalletRoundTrip[]> => {
  return withErrorHandling(async () => {
    const q = new URLSearchParams();
    q.set("sort_by", params.sortBy);
    q.set("sort_dir", params.sortDir);
    q.set("limit", String(params.limit ?? 100));
    if (params.coin && params.coin.trim()) q.set("coin", params.coin.trim().toUpperCase());
    const res = await get<Envelope<WalletRoundTrip[]>>(`/indexer/completed-trades/?${q.toString()}`);
    return res.data ?? [];
  }, "fetching trade explorer");
};

export const useTradeExplorer = (params: TradeExplorerParams) => {
  const { data, isLoading, error, refetch } = useDataFetching<WalletRoundTrip[]>({
    fetchFn: () => fetchTradeExplorer(params),
    dependencies: [params.coin ?? "", params.sortBy, params.sortDir],
    refreshInterval: 60000,
    maxRetries: 1,
  });
  return { trades: data ?? [], isLoading, error, refetch };
};

export const fetchTradeSummary = async (): Promise<TradeSummary | null> => {
  return withErrorHandling(async () => {
    const res = await get<Envelope<TradeSummary>>(`/indexer/completed-trades/summary`);
    return res.data ?? null;
  }, "fetching trade summary");
};

export const useTradeSummary = () => {
  const { data, isLoading, error, refetch } = useDataFetching<TradeSummary | null>({
    fetchFn: fetchTradeSummary,
    refreshInterval: 300000,
    maxRetries: 1,
  });
  return { summary: data ?? null, isLoading, error, refetch };
};
