import { useEffect } from 'react';
import { useHypePriceStore } from '../websocket.service';
import { UseHypePriceResult } from '../types';

/**
 * Keeps the shared HYPE trade socket open. The socket is intentionally never
 * closed on unmount (many components share it app-wide); this re-arms it when
 * it drops.
 */
function useHypePriceConnection(): boolean {
  const isConnected = useHypePriceStore((s) => s.isConnected);
  const connect = useHypePriceStore((s) => s.connect);

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  return isConnected;
}

/**
 * Custom hook to get the real-time HYPE token price
 */
export function useHypePrice(): UseHypePriceResult {
  const isConnected = useHypePriceConnection();
  const currentPrice = useHypePriceStore((s) => s.currentPrice);
  const lastSide = useHypePriceStore((s) => s.lastSide);
  const error = useHypePriceStore((s) => s.error);

  return {
    price: currentPrice || null,
    lastSide,
    isLoading: !isConnected,
    error
  };
}

/**
 * Live HYPE price only. Unlike `useHypePrice`, it doesn't re-render on the
 * buy/sell flash (`lastSide`) or on repeated trades at the same price — use it
 * wherever the price is just an input to a computation.
 */
export function useHypeLivePrice(): number | null {
  useHypePriceConnection();
  return useHypePriceStore((s) => s.currentPrice) || null;
}
