import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTokenWebSocketStore } from '../websocket.service';
import { TokenWebSocketState, UseTokenWebSocketResult } from '../types';

/**
 * Holds a reference on the shared token socket for `coinId` while mounted.
 * Every `connect` is paired with exactly one `disconnect` — the store is
 * ref-counted, so the socket only closes when its last consumer leaves.
 */
function useTokenWebSocketConnection(coinId: string): void {
  useEffect(() => {
    if (!coinId || coinId.trim() === '') return;

    const { connect, disconnect } = useTokenWebSocketStore.getState();
    let connected = false;
    // Small delay to prevent multiple rapid connections in development
    const timeoutId = setTimeout(() => {
      connect(coinId);
      connected = true;
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (connected) disconnect();
    };
  }, [coinId]);
}

/**
 * Subscribe to a slice of the live token stream. Components only re-render
 * when their slice changes (an order-book push doesn't re-render the chart).
 */
function useTokenWebSocketSlice<T extends object>(
  coinId: string,
  selector: (state: TokenWebSocketState) => T,
): T {
  useTokenWebSocketConnection(coinId);
  return useTokenWebSocketStore(useShallow(selector));
}

/**
 * Custom hook to get real-time token data via WebSocket
 * @param coinId - The coin ID (e.g., "@107" for HYPE)
 */
export function useTokenWebSocket(coinId: string): UseTokenWebSocketResult {
  return useTokenWebSocketSlice(coinId, (s) => ({
    price: s.currentPrice || null,
    lastSide: s.lastSide,
    orderBook: s.orderBook,
    trades: s.trades,
    isLoading: !s.isConnected,
    error: s.error,
  }));
}

/** Live price only — no re-render on order-book or trade-list updates. */
export function useTokenLivePrice(coinId: string): Pick<UseTokenWebSocketResult, 'price' | 'lastSide' | 'isLoading'> {
  return useTokenWebSocketSlice(coinId, (s) => ({
    price: s.currentPrice || null,
    lastSide: s.lastSide,
    isLoading: !s.isConnected,
  }));
}

/** Recent trades only — no re-render on order-book updates. */
export function useTokenTrades(coinId: string): Pick<UseTokenWebSocketResult, 'trades' | 'isLoading'> {
  return useTokenWebSocketSlice(coinId, (s) => ({
    trades: s.trades,
    isLoading: !s.isConnected,
  }));
}
