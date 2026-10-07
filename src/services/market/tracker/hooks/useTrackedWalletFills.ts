"use client";

import { useEffect, useRef, useState } from "react";
import { WebSocketClient } from "@/lib/websocket-client";

const WS_URL = "wss://api.hyperliquid.xyz/ws";
/**
 * Hyperliquid allows at most 10 distinct users across user-specific websocket
 * subscriptions per IP. Past that the server rejects the subscription, so the
 * live feed watches the first 10 wallets and says so.
 */
export const LIVE_WALLET_CAP = 10;
const MAX_FILLS = 200;
const FLUSH_MS = 750;

export interface TrackedFill {
  /** Unique per fill: `${wallet}:${tid}`. */
  key: string;
  wallet: string;
  coin: string;
  /** "B" buy, "A" sell (Hyperliquid convention). */
  side: "B" | "A";
  px: number;
  sz: number;
  ntl: number;
  /** "Open Long", "Close Short", "Buy", "Sell", ... */
  dir: string;
  closedPnl: number;
  time: number;
  hash?: string;
  /** True for fills that arrived live, after the initial snapshot. */
  live: boolean;
}

interface WsFill {
  coin: string;
  px: string;
  sz: string;
  side: "B" | "A";
  time: number;
  dir: string;
  closedPnl: string;
  hash: string;
  tid: number;
}

interface WsFrame {
  channel?: string;
  data?: { user?: string; isSnapshot?: boolean; fills?: WsFill[] };
}

const ZERO_HASH = /^0x0+$/;

/**
 * Live fills of the tracked wallets over Hyperliquid's public websocket
 * (`userFills`, one subscription per wallet). The first frame of each
 * subscription is a snapshot of recent fills: it seeds the feed without
 * firing `onLiveFill`. Later frames are new fills and call `onLiveFill`.
 * Buffered in refs and flushed to React at most every 750 ms.
 */
export function useTrackedWalletFills(
  addresses: string[],
  { enabled = true, onLiveFill }: { enabled?: boolean; onLiveFill?: (fills: TrackedFill[]) => void } = {}
) {
  const [state, setState] = useState<{ fills: TrackedFill[]; connected: boolean }>({ fills: [], connected: false });
  const watched = addresses.map((a) => a.toLowerCase()).slice(0, LIVE_WALLET_CAP);
  const key = watched.join(",");

  const onLiveRef = useRef(onLiveFill);
  onLiveRef.current = onLiveFill;

  useEffect(() => {
    if (!enabled || !key) {
      setState({ fills: [], connected: false });
      return;
    }
    const wallets = key.split(",");
    const fills = new Map<string, TrackedFill>();
    const pendingLive: TrackedFill[] = [];
    let connected = false;
    let dirty = false;

    const client = new WebSocketClient({
      url: WS_URL,
      maxReconnectAttempts: 10,
      baseReconnectDelay: 2000,
      onOpen: () => {
        connected = true;
        dirty = true;
        for (const user of wallets) {
          client.send({ method: "subscribe", subscription: { type: "userFills", user } });
        }
      },
      onClose: () => {
        connected = false;
        dirty = true;
      },
      onMessage: (raw) => {
        const frame = raw as WsFrame;
        if (frame.channel !== "userFills" || !frame.data?.fills) return;
        const wallet = (frame.data.user ?? "").toLowerCase();
        // A reconnect replays the snapshot: only fills never seen count as live.
        const live = !frame.data.isSnapshot;
        for (const f of frame.data.fills) {
          const k = `${wallet}:${f.tid}`;
          if (fills.has(k)) continue;
          const px = Number(f.px);
          const sz = Number(f.sz);
          const fill: TrackedFill = {
            key: k,
            wallet,
            coin: f.coin,
            side: f.side,
            px,
            sz,
            ntl: px * sz,
            dir: f.dir,
            closedPnl: Number(f.closedPnl) || 0,
            time: f.time,
            hash: f.hash && !ZERO_HASH.test(f.hash) ? f.hash : undefined,
            live,
          };
          fills.set(k, fill);
          if (live) pendingLive.push(fill);
          dirty = true;
        }
      },
    });
    client.connect();

    const timer = setInterval(() => {
      if (pendingLive.length) {
        const batch = pendingLive.splice(0, pendingLive.length);
        onLiveRef.current?.(batch);
      }
      if (!dirty) return;
      dirty = false;
      let list = [...fills.values()].sort((a, b) => b.time - a.time);
      if (list.length > MAX_FILLS) {
        list = list.slice(0, MAX_FILLS);
        const keep = new Set(list.map((f) => f.key));
        for (const k of fills.keys()) if (!keep.has(k)) fills.delete(k);
      }
      setState({ fills: list, connected });
    }, FLUSH_MS);

    return () => {
      clearInterval(timer);
      client.disconnect();
    };
  }, [enabled, key]);

  return { ...state, watchedCount: watched.length, totalCount: addresses.length };
}
