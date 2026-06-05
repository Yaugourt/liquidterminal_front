import { useMemo } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4OrderBook } from "../api";
import type { Hip4L2Book, Hip4BookLevel } from "../types";

export interface UseHip4OrderBookResult {
  book: Hip4L2Book | null;
  bids: Hip4BookLevel[];
  asks: Hip4BookLevel[];
  /** Mid implied probability (0–1) from the top of book. */
  mid: number | null;
  /** Ask − bid (probability units). */
  spread: number | null;
  /** Spread as a % of mid. */
  spreadPct: number | null;
  /** True when a non-empty live book came back (false for expired coins). */
  available: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Live L2 order book for a HIP-4 outcome coin, REST-polled every 5s (the shared
 * market WS doesn't carry `#NNN` coins). Only fetches eligible live coins
 * (`#NNN`, `enabled`); expired/untradeable coins return `null` upstream so the
 * UI degrades to a placeholder rather than polling a dead book tightly.
 */
export function useHip4OrderBook(coin: string, enabled = true): UseHip4OrderBookResult {
  const eligible = enabled && /^#\d+$/.test(coin);

  const { data, isLoading, error, refetch } = useDataFetching<Hip4L2Book | null>({
    fetchFn: () => (eligible ? fetchHip4OrderBook(coin) : Promise.resolve(null)),
    // Real-time when live; back right off when there's nothing to poll.
    refreshInterval: eligible ? 5000 : 600000,
    dependencies: [coin, eligible],
    maxRetries: 1,
  });

  return useMemo(() => {
    const book = data ?? null;
    const bids = book?.levels?.[0] ?? [];
    const asks = book?.levels?.[1] ?? [];
    const bestBid = bids.length ? parseFloat(bids[0].px) : null;
    const bestAsk = asks.length ? parseFloat(asks[0].px) : null;
    const mid =
      bestBid != null && bestAsk != null && Number.isFinite(bestBid) && Number.isFinite(bestAsk)
        ? (bestBid + bestAsk) / 2
        : null;
    const spread =
      bestBid != null && bestAsk != null && Number.isFinite(bestBid) && Number.isFinite(bestAsk)
        ? bestAsk - bestBid
        : null;
    const spreadPct = spread != null && mid != null && mid > 0 ? (spread / mid) * 100 : null;

    return {
      book,
      bids,
      asks,
      mid,
      spread,
      spreadPct,
      available: bids.length > 0 || asks.length > 0,
      isLoading,
      error,
      refetch,
    };
  }, [data, isLoading, error, refetch]);
}
