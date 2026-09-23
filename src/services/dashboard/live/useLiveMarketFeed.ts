"use client";

import { useEffect, useRef, useState } from "react";
import { WebSocketClient } from "@/lib/websocket-client";

const WS_URL = "wss://api.hyperliquid.xyz/ws";
/** Lowest print kept in memory; the UI threshold chips filter on top of it. */
const PRINT_FLOOR_USD = 10_000;
/** Prints older than this drop out (the buy/sell bar reads this window). */
export const PRINT_WINDOW_MS = 5 * 60_000;
const MAX_PRINTS = 400;
/** React sees the stream at most once per second, never once per trade. */
const FLUSH_MS = 1_000;

/** One trade at or above the print floor, from the public `trades` channel. */
export interface LivePrint {
  tid: number;
  coin: string;
  /** "B" = buyer was the aggressor, "A" = seller (Hyperliquid convention). */
  side: "B" | "A";
  px: number;
  sz: number;
  /** USD notional, px * sz. */
  ntl: number;
  /** Epoch ms. */
  time: number;
}

interface WsTrade {
  coin: string;
  side: "B" | "A";
  px: string;
  sz: string;
  time: number;
  tid: number;
}

interface WsFrame {
  channel?: string;
  data?: unknown;
}

export interface LiveMarketFeed {
  /** Prints at or above the floor, newest first, within PRINT_WINDOW_MS. */
  prints: LivePrint[];
  /** Latest mid per coin, limited to `boardCoins`. */
  mids: Record<string, number>;
  connected: boolean;
}

/**
 * Keyless live market feed straight from the Hyperliquid public websocket:
 * `trades` on `tapeCoins` (for the big-prints tape) and `allMids` (for the
 * price board). One socket, buffered in refs and flushed to React once per
 * second so a busy tape never re-renders the page per trade.
 */
export function useLiveMarketFeed(tapeCoins: string[], boardCoins: string[]): LiveMarketFeed {
  const [state, setState] = useState<LiveMarketFeed>({ prints: [], mids: {}, connected: false });

  const clientRef = useRef<WebSocketClient | null>(null);
  const subscribedRef = useRef<Set<string>>(new Set());
  const wantedRef = useRef<string[]>(tapeCoins);
  const boardRef = useRef<string[]>(boardCoins);
  const printsRef = useRef<LivePrint[]>([]);
  const seenRef = useRef<Set<number>>(new Set());
  const midsRef = useRef<Record<string, number>>({});
  const connectedRef = useRef(false);
  const dirtyRef = useRef(false);

  wantedRef.current = tapeCoins;
  boardRef.current = boardCoins;

  // Brings the socket's trade subscriptions in line with `wantedRef`.
  const syncSubscriptionsRef = useRef(() => {});
  syncSubscriptionsRef.current = () => {
    const client = clientRef.current;
    if (!client || !client.isConnected()) return;
    const wanted = new Set(wantedRef.current);
    for (const coin of subscribedRef.current) {
      if (!wanted.has(coin)) {
        client.send({ method: "unsubscribe", subscription: { type: "trades", coin } });
        subscribedRef.current.delete(coin);
      }
    }
    for (const coin of wanted) {
      if (!subscribedRef.current.has(coin)) {
        client.send({ method: "subscribe", subscription: { type: "trades", coin } });
        subscribedRef.current.add(coin);
      }
    }
  };

  useEffect(() => {
    const client = new WebSocketClient({
      url: WS_URL,
      maxReconnectAttempts: 10,
      baseReconnectDelay: 2000,
      onOpen: () => {
        connectedRef.current = true;
        dirtyRef.current = true;
        // A fresh socket holds no subscriptions, including after a reconnect.
        subscribedRef.current = new Set();
        client.send({ method: "subscribe", subscription: { type: "allMids" } });
        syncSubscriptionsRef.current();
      },
      onClose: () => {
        connectedRef.current = false;
        dirtyRef.current = true;
      },
      onMessage: (raw) => {
        const frame = raw as WsFrame;
        if (frame.channel === "trades" && Array.isArray(frame.data)) {
          const cutoff = Date.now() - PRINT_WINDOW_MS;
          for (const t of frame.data as WsTrade[]) {
            const px = Number(t.px);
            const sz = Number(t.sz);
            const ntl = px * sz;
            if (!(ntl >= PRINT_FLOOR_USD) || t.time < cutoff || seenRef.current.has(t.tid)) continue;
            seenRef.current.add(t.tid);
            printsRef.current.push({ tid: t.tid, coin: t.coin, side: t.side, px, sz, ntl, time: t.time });
            dirtyRef.current = true;
          }
        } else if (frame.channel === "allMids") {
          const mids = (frame.data as { mids?: Record<string, string> } | undefined)?.mids;
          if (!mids) return;
          for (const coin of boardRef.current) {
            const v = Number(mids[coin]);
            if (Number.isFinite(v) && v > 0) midsRef.current[coin] = v;
          }
          dirtyRef.current = true;
        }
      },
    });
    clientRef.current = client;
    client.connect();

    const timer = setInterval(() => {
      const cutoff = Date.now() - PRINT_WINDOW_MS;
      const before = printsRef.current.length;
      let prints = printsRef.current.filter((p) => p.time >= cutoff);
      if (prints.length !== before) dirtyRef.current = true;
      if (!dirtyRef.current) return;
      prints.sort((a, b) => b.time - a.time || b.tid - a.tid);
      if (prints.length > MAX_PRINTS) prints = prints.slice(0, MAX_PRINTS);
      printsRef.current = prints;
      seenRef.current = new Set(prints.map((p) => p.tid));
      dirtyRef.current = false;
      setState({ prints, mids: { ...midsRef.current }, connected: connectedRef.current });
    }, FLUSH_MS);

    return () => {
      clearInterval(timer);
      client.disconnect();
      clientRef.current = null;
    };
  }, []);

  // Re-subscribe when the tracked coin set changes (not on every reorder).
  const tapeKey = [...tapeCoins].sort().join(",");
  useEffect(() => {
    syncSubscriptionsRef.current();
  }, [tapeKey]);

  return state;
}
