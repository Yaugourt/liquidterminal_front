import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";

interface IndexerEnvelope<T> {
  success: boolean;
  data: T;
}

interface DailyPnlRow {
  date: string;
  coin: string;
  pnl: number;
}

export interface CoinPnl {
  coin: string;
  /** Net realized PnL across all traders on this coin over the window, USD. */
  pnl: number;
}

/**
 * Net trader realized PnL per market over the last 10 days — which markets made
 * traders money and which bled them. The backend returns per-day-per-coin rows;
 * summing to a per-coin total is a cheap client aggregation, sorted by PnL.
 */
export const fetchTraderPnlByCoin = async (): Promise<CoinPnl[]> => {
  return withErrorHandling(async () => {
    const res = await get<IndexerEnvelope<DailyPnlRow[]>>(`/indexer/overview/daily-pnl-10d`);
    const rows = res.data ?? [];
    const byCoin = new Map<string, number>();
    for (const r of rows) {
      if (typeof r.pnl !== "number" || !r.coin) continue;
      byCoin.set(r.coin, (byCoin.get(r.coin) ?? 0) + r.pnl);
    }
    return Array.from(byCoin.entries())
      .map(([coin, pnl]) => ({ coin, pnl }))
      .sort((a, b) => b.pnl - a.pnl);
  }, "fetching trader pnl by coin");
};

export const useTraderPnlByCoin = () => {
  const { data, isLoading, error, refetch } = useDataFetching<CoinPnl[]>({
    fetchFn: fetchTraderPnlByCoin,
    refreshInterval: 300000,
    maxRetries: 1,
  });
  return { coins: data ?? [], isLoading, error, refetch };
};
