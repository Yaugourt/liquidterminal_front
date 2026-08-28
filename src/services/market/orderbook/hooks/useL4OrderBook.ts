import { useEffect } from 'react';
import { useL4BookStore } from '../websocket.store';
import type { UseL4OrderBookResult } from '../types';

/**
 * Live L4 order book for one coin, streamed from LiquidTerminal's `/ws`.
 *
 * Works for every market type Hyperliquid exposes — perps (`BTC`), spot
 * (`@107`, `PURR/USDC`), HIP-3 assets (`xyz:SKHX`) and HIP-4 outcomes
 * (`#10250`) — because the upstream mirror keys books by coin id alone.
 *
 * @param coin    Coin id as Hyperliquid names it.
 * @param enabled Set false to hold off (unknown coin, hidden panel).
 */
export function useL4OrderBook(coin: string, enabled = true): UseL4OrderBookResult {
  const { bids, asks, totals, depth, status, lastUpdate, error, connect, disconnect } =
    useL4BookStore();

  useEffect(() => {
    if (!enabled || !coin || coin.trim() === '') return;

    // Small delay so React 18 double-mounts in dev don't open two sockets.
    const timeoutId = setTimeout(() => connect(coin), 100);
    return () => clearTimeout(timeoutId);
  }, [coin, enabled, connect]);

  useEffect(() => () => disconnect(), [disconnect]);

  return {
    bids,
    asks,
    totals,
    depth,
    status,
    isLive: status === 'live',
    isLoading: status === 'connecting' || status === 'idle',
    lastUpdate,
    error,
  };
}
