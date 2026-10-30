import { useMemo } from "react";
import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useTwapLive } from "@/services/market/order/hooks/useTwapLive";
import { isTerminal } from "@/services/market/order/twap-status";
import type { TwapLiveEntry } from "@/services/market/order/types";

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
const DAY_MS = 86_400_000;

const NO_LIVE: ReadonlyMap<number, TwapLiveEntry> = new Map();

/**
 * Ranks TWAP rows by executed notional, with the live feed laid over them
 * first: a running row takes the executed amounts the feed has seen since
 * the poll (a terminal status from the feed wins too), and a TWAP only the
 * feed knows (the poll lags a few seconds) joins when it has a full entry,
 * is terminal or has a fill, started in the last 24 hours (the window of the
 * ranking) and clears the floor, like any other.
 */
export const rankTwapFlow = (
  rows: TwapFlow[],
  live: ReadonlyMap<number, TwapLiveEntry>,
  limit: number,
  now: number = Date.now()
): TwapFlow[] => {
  const merged: TwapFlow[] = [];
  const seen = new Set<number>();
  for (const row of rows) {
    seen.add(row.twapId);
    const entry = live.get(row.twapId);
    if (entry && !isTerminal(row.status)) {
      const status = entry.status !== undefined && isTerminal(entry.status) ? entry.status : row.status;
      merged.push(
        entry.executedNtl > row.executedNtl
          ? { ...row, status, executedSz: entry.executedSz, executedNtl: entry.executedNtl }
          : { ...row, status }
      );
    } else {
      merged.push(row);
    }
  }
  for (const [id, e] of live) {
    if (seen.has(id)) continue;
    if (e.status === undefined || e.coin === undefined || e.user === undefined || e.side === undefined) continue;
    if (e.sz === undefined || e.minutes === undefined || e.startTime === undefined) continue;
    if (!isTerminal(e.status) && e.fills <= 0) continue;
    if (e.startTime < now - DAY_MS) continue;
    merged.push({
      twapId: id,
      coin: e.coin,
      user: e.user,
      side: e.side,
      sz: e.sz,
      executedSz: e.executedSz,
      executedNtl: e.executedNtl,
      minutes: e.minutes,
      status: e.status,
      startTime: new Date(e.startTime).toISOString(),
    });
  }
  return merged
    .filter((t) => (t.executedNtl ?? 0) >= NTL_FLOOR)
    .sort((a, b) => (b.executedNtl ?? 0) - (a.executedNtl ?? 0))
    .slice(0, limit);
};

/** The 24h TWAP rows as the backend serves them, unranked. */
const fetchTwapFlowRows = async (): Promise<TwapFlow[]> => {
  return withErrorHandling(async () => {
    const res = await get<IndexerEnvelope<TwapFlow[]>>(`/indexer/twaps`, {
      limit: 150,
      hours: 24,
    });
    return res.data ?? [];
  }, "fetching twap flow");
};

/**
 * Biggest TWAP executions over the last 24h, ranked by executed notional — the
 * largest sliced accumulation / distribution orders on Hyperliquid. The backend
 * serves the raw TWAP list; ranking to the top flows is a cheap client sort
 * (fresh TWAPs with no fills yet drop out under the notional floor).
 */
export const fetchTwapFlow = async (limit = 6): Promise<TwapFlow[]> =>
  rankTwapFlow(await fetchTwapFlowRows(), NO_LIVE, limit);

export const useTwapFlow = (limit = 6) => {
  const { data, isLoading, error, isStale, refetch } = useDataFetching<TwapFlow[]>({
    fetchFn: fetchTwapFlowRows,
    // Live flows: one shared backend key, refreshed every 15s; the live feed
    // moves the executed amounts and adds new TWAPs in between.
    refreshInterval: 15000,
    maxRetries: 1,
  });
  const live = useTwapLive();
  const twaps = useMemo(() => rankTwapFlow(data ?? [], live.entries, limit), [data, live.entries, limit]);
  return { twaps, isLoading, error, isStale, refetch };
};
