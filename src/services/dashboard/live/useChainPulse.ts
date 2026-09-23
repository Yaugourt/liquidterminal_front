"use client";

import { useEffect, useRef, useState } from "react";
import { WebSocketClient } from "@/lib/websocket-client";

const WS_URL = "wss://rpc.hyperliquid.xyz/ws";
/** Rolling window the rates and the sparkline read. */
const WINDOW_S = 60;
const FLUSH_MS = 1_000;

interface WsBlock {
  height: number;
  blockTime: number;
  numTxs: number;
}

interface WsTx {
  action?: { type?: string };
}

export interface ActionShare {
  type: string;
  share: number;
}

export interface ChainPulse {
  connected: boolean;
  height: number | null;
  /** Blocks per second over the rolling window. */
  blocksPerSec: number | null;
  /** Transactions per second, summed from each block header's `numTxs`. */
  txPerSec: number | null;
  /** Transactions per completed second, oldest first (up to WINDOW_S points). */
  txSeries: number[];
  /**
   * Action mix of the `explorerTxs` stream. That stream is a sample of the
   * chain's transactions, so only shares are meaningful, never totals.
   */
  mix: ActionShare[];
  mixSample: number;
}

const EMPTY: ChainPulse = {
  connected: false,
  height: null,
  blocksPerSec: null,
  txPerSec: null,
  txSeries: [],
  mix: [],
  mixSample: 0,
};

/**
 * HyperCore heartbeat from the public explorer websocket: block height, block
 * and transaction rates, and the action mix. Own socket, buffered in refs and
 * flushed once per second (blocks land ~15 per second).
 */
export function useChainPulse(): ChainPulse {
  const [pulse, setPulse] = useState<ChainPulse>(EMPTY);

  const blocksRef = useRef<WsBlock[]>([]);
  const txsRef = useRef<{ t: number; type: string }[]>([]);
  const heightRef = useRef<number | null>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    const client = new WebSocketClient({
      url: WS_URL,
      maxReconnectAttempts: 10,
      baseReconnectDelay: 2000,
      onOpen: () => {
        connectedRef.current = true;
        client.send({ method: "subscribe", subscription: { type: "explorerBlock" } });
        client.send({ method: "subscribe", subscription: { type: "explorerTxs" } });
      },
      onClose: () => {
        connectedRef.current = false;
      },
      onMessage: (raw) => {
        if (!Array.isArray(raw) || raw.length === 0) return;
        const first = raw[0] as Record<string, unknown>;
        if ("blockTime" in first) {
          for (const b of raw as WsBlock[]) {
            blocksRef.current.push({ height: b.height, blockTime: b.blockTime, numTxs: b.numTxs ?? 0 });
            if (heightRef.current == null || b.height > heightRef.current) heightRef.current = b.height;
          }
        } else if ("action" in first) {
          const now = Date.now();
          for (const tx of raw as WsTx[]) txsRef.current.push({ t: now, type: tx.action?.type ?? "other" });
        }
      },
    });
    client.connect();

    const timer = setInterval(() => {
      const blocks = blocksRef.current;
      const latest = blocks.reduce((m, b) => Math.max(m, b.blockTime), 0);
      const cutoff = latest - WINDOW_S * 1000;
      const kept = blocks.filter((b) => b.blockTime >= cutoff);
      blocksRef.current = kept;

      const txCutoff = Date.now() - WINDOW_S * 1000;
      const txs = txsRef.current.filter((x) => x.t >= txCutoff);
      txsRef.current = txs;

      let blocksPerSec: number | null = null;
      let txPerSec: number | null = null;
      const txSeries: number[] = [];
      if (kept.length > 1) {
        const earliest = kept.reduce((m, b) => Math.min(m, b.blockTime), Infinity);
        const spanS = (latest - earliest) / 1000;
        if (spanS >= 1) {
          blocksPerSec = kept.length / spanS;
          txPerSec = kept.reduce((s, b) => s + b.numTxs, 0) / spanS;
        }
        // Completed seconds only: the latest second is still filling.
        const firstSec = Math.floor(earliest / 1000);
        const lastSec = Math.floor(latest / 1000) - 1;
        const buckets = new Map<number, number>();
        for (const b of kept) {
          const sec = Math.floor(b.blockTime / 1000);
          buckets.set(sec, (buckets.get(sec) ?? 0) + b.numTxs);
        }
        for (let s = firstSec + 1; s <= lastSec; s++) txSeries.push(buckets.get(s) ?? 0);
      }

      const counts = new Map<string, number>();
      for (const x of txs) counts.set(x.type, (counts.get(x.type) ?? 0) + 1);
      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      const top = ranked.slice(0, 3);
      const rest = ranked.slice(3).reduce((s, [, n]) => s + n, 0);
      const mix: ActionShare[] = txs.length
        ? [...top, ...(rest > 0 ? ([["other", rest]] as [string, number][]) : [])].map(([type, n]) => ({
            type,
            share: n / txs.length,
          }))
        : [];

      setPulse({
        connected: connectedRef.current,
        height: heightRef.current,
        blocksPerSec,
        txPerSec,
        txSeries,
        mix,
        mixSample: txs.length,
      });
    }, FLUSH_MS);

    return () => {
      clearInterval(timer);
      client.disconnect();
    };
  }, []);

  return pulse;
}
