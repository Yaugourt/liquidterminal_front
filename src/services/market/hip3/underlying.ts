import { useMemo } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { REFRESH_INTERVALS } from "@/services/api/constants";
import type { UnderlyingClass } from "@/lib/hip3/underlying";

export type UnderlyingUnavailableReason = "unmapped" | "unconfigured" | "plan" | "upstream";

export interface UnderlyingQuote {
  available: true;
  symbol: string;
  assetClass: UnderlyingClass;
  market: string;
  basisComparable: boolean;
  basisNote: string | null;
  price: number;
  previousClose: number | null;
  changePercent: number | null;
  /** Trading date of `price`. */
  quotedOn: string | null;
  /** Real session state. Null when the instrument has no cash-equity calendar. */
  marketOpen: boolean | null;
}

export interface UnderlyingUnavailable {
  available: false;
  reason: UnderlyingUnavailableReason;
}

export type UnderlyingResponse = UnderlyingQuote | UnderlyingUnavailable;

/**
 * The real instrument behind a HIP-3 synthetic, via this app's own server route.
 *
 * Fetched directly rather than through the shared axios helpers: the target is
 * a same-origin Next route, not the LiquidTerminal backend, so it needs neither
 * the base URL nor the Privy bearer those helpers attach.
 */
async function fetchUnderlying(coin: string, signal?: AbortSignal): Promise<UnderlyingResponse> {
  const response = await fetch(`/api/hip3/underlying?coin=${encodeURIComponent(coin)}`, {
    signal,
  });
  if (!response.ok) {
    return { available: false, reason: "upstream" };
  }
  return (await response.json()) as UnderlyingResponse;
}

export interface Hip3Basis {
  quote: UnderlyingQuote | null;
  /** Why nothing is shown. Null while loading or when a quote is present. */
  unavailable: UnderlyingUnavailableReason | null;
  /**
   * Synthetic minus underlying, in basis points. Null when the mapping is not
   * comparable (different contract or expiry) — publishing a gap that is really
   * a contract mismatch would read as a mispricing that does not exist.
   */
  basisBps: number | null;
  /**
   * Same gap against the underlying's last close, as a percentage. While the
   * cash market is shut — nights and weekends, most of the time a perp trades —
   * this is the reopening gap the synthetic is pricing in.
   */
  impliedGapPercent: number | null;
  /**
   * Whether the cash market is trading right now. Read from the exchange
   * calendar, not guessed from how old the price is — that heuristic called the
   * market "live" for the six hours after the close, and "closed" all session.
   */
  marketOpen: boolean | null;
  isLoading: boolean;
}

export function useHip3Underlying(coin: string | null, markPx: number | null): Hip3Basis {
  const { data, isLoading } = useDataFetching<UnderlyingResponse | null>({
    fetchFn: (signal) => (coin ? fetchUnderlying(coin, signal) : Promise.resolve(null)),
    dependencies: [coin],
    // The route caches for hours; this only picks up its refresh.
    refreshInterval: REFRESH_INTERVALS.HOURLY,
    maxRetries: 1,
  });

  return useMemo(() => {
    const quote = data && data.available ? data : null;
    const unavailable = data && !data.available ? data.reason : null;

    let basisBps: number | null = null;
    let impliedGapPercent: number | null = null;

    if (quote && markPx && quote.basisComparable && quote.price > 0) {
      basisBps = ((markPx - quote.price) / quote.price) * 10_000;
      impliedGapPercent = ((markPx - quote.price) / quote.price) * 100;
    }

    return {
      quote,
      unavailable,
      basisBps,
      impliedGapPercent,
      marketOpen: quote?.marketOpen ?? null,
      isLoading,
    };
  }, [data, markPx, isLoading]);
}
