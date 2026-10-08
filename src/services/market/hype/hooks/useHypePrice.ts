import { useEffect, useMemo } from 'react';
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

/**
 * Live HYPE price and 24h change from the HYPE socket alone (last trade, else
 * the asset context's mark; change against its previous-day price). For spots
 * that only show these two numbers: `useHypeOverview` also polls the supply
 * (`tokenDetails` through the backend) and the Assistance Fund state.
 */
export function useHypeDayChange(): { price: number | null; change24hPct: number | null } {
  useHypePriceConnection();
  const tradePx = useHypePriceStore((s) => s.currentPrice);
  const markPx = useHypePriceStore((s) => s.markPx);
  const prevDayPx = useHypePriceStore((s) => s.prevDayPx);

  return useMemo(() => {
    const price = tradePx > 0 ? tradePx : markPx > 0 ? markPx : null;
    const change24hPct =
      price !== null && prevDayPx > 0 ? ((price - prevDayPx) / prevDayPx) * 100 : null;
    return { price, change24hPct };
  }, [tradePx, markPx, prevDayPx]);
}

/**
 * HYPE 24h spot notional volume (USD) from the HYPE socket's asset context —
 * the figure `spotMetaAndAssetCtxs` returns (a ~320 KB read of every spot
 * pair), pushed about once a second. Null until the first frame.
 */
export function useHypeDayVolume(): number | null {
  useHypePriceConnection();
  return useHypePriceStore((s) => s.dayNtlVlm) || null;
}
