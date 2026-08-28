import { create } from 'zustand';
import { env } from '@/lib/env';
import { WebSocketClient } from '@/lib/websocket-client';
import type {
  L4BookLevel,
  L4BookMessage,
  L4BookStore,
  L4BookTotals,
} from './types';

/**
 * LiquidTerminal's own `/ws`, not Hyperliquid's. The L4 mirror needs a
 * server-side API key and pushes ~1.4 MB snapshots, so the backend holds the
 * book and streams us a 100-level ladder (~4-8 KiB) plus ~300 B deltas.
 */
const buildWSUrl = (): string => {
  const apiUrl = env.NEXT_PUBLIC_API;
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  return `${wsProtocol}://${apiUrl.replace(/^https?:\/\//, '')}/ws`;
};

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1500;

/** Apply a delta side in place. Size 0 is the server's "level is gone" marker. */
function applyDelta(side: Map<number, L4BookLevel>, levels: L4BookLevel[]): void {
  for (const level of levels) {
    if (level[1] === 0) side.delete(level[0]);
    else side.set(level[0], level);
  }
}

function ladder(side: Map<number, L4BookLevel>, direction: 'desc' | 'asc'): L4BookLevel[] {
  return [...side.values()].sort((a, b) => (direction === 'desc' ? b[0] - a[0] : a[0] - b[0]));
}

/**
 * Streams one coin's L4 order book. Single active coin, like the token trade
 * socket: a trading page shows one book, and switching coins tears the previous
 * subscription down so the backend stops mirroring a book nobody watches.
 */
export const useL4BookStore = create<L4BookStore>((set, get) => {
  let client: WebSocketClient | null = null;
  let currentCoin: string | null = null;
  // Level maps are the source of truth; the sorted arrays in state are derived.
  let bidMap = new Map<number, L4BookLevel>();
  let askMap = new Map<number, L4BookLevel>();

  const resetBook = () => {
    bidMap = new Map();
    askMap = new Map();
  };

  const publish = (totals: L4BookTotals, time: number, depth?: number) => {
    const cap = depth ?? get().depth;
    // The server ships a fixed-depth window, so holding more than that means a
    // level was added without its removal ever arriving. Trim rather than let a
    // corrupt ladder render.
    const trim = (levels: L4BookLevel[]) => (cap > 0 ? levels.slice(0, cap) : levels);

    set({
      bids: trim(ladder(bidMap, 'desc')),
      asks: trim(ladder(askMap, 'asc')),
      totals,
      lastUpdate: time,
      status: 'live',
      error: null,
      ...(depth !== undefined ? { depth } : {}),
    });
  };

  const subscribe = (coin: string) => {
    client?.send({ method: 'subscribe', subscription: { type: 'l4book', coin } });
  };

  return {
    coin: null,
    status: 'idle',
    bids: [],
    asks: [],
    totals: null,
    depth: 0,
    lastUpdate: null,
    error: null,

    connect: (coin: string) => {
      if (typeof window === 'undefined') return;
      if (!coin || coin.trim() === '') return;

      // Same coin: the client is idempotent while OPEN/CONNECTING and reconnects
      // if it has dropped.
      if (client && currentCoin === coin) {
        client.connect();
        return;
      }

      if (client) {
        if (currentCoin) {
          client.send({ method: 'unsubscribe', subscription: { type: 'l4book', coin: currentCoin } });
        }
        client.disconnect();
        client = null;
      }

      currentCoin = coin;
      resetBook();
      set({
        coin,
        status: 'connecting',
        bids: [],
        asks: [],
        totals: null,
        depth: 0,
        lastUpdate: null,
        error: null,
      });

      client = new WebSocketClient({
        url: buildWSUrl(),
        maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
        baseReconnectDelay: RECONNECT_DELAY,
        debug: process.env.NODE_ENV === 'development',

        onOpen: () => {
          // A reconnect lands here too: the book we held is stale, so drop it
          // and wait for the fresh snapshot.
          resetBook();
          subscribe(coin);
        },

        onMessage: (data: unknown) => {
          const message = data as L4BookMessage;

          switch (message.type) {
            case 'connected':
              // The greeting can arrive after our subscribe on a slow open;
              // re-sending is harmless (the server answers with a snapshot).
              subscribe(coin);
              break;

            case 'l4book_snapshot': {
              const payload = message.data;
              if (payload.coin.toLowerCase() !== coin.toLowerCase()) return;
              bidMap = new Map(payload.bids.map((l) => [l[0], l]));
              askMap = new Map(payload.asks.map((l) => [l[0], l]));
              publish(payload.totals, payload.time, payload.depth);
              break;
            }

            case 'l4book_delta': {
              const payload = message.data;
              if (payload.coin.toLowerCase() !== coin.toLowerCase()) return;
              // A delta before the snapshot would build a book from nothing.
              if (get().status !== 'live') return;
              applyDelta(bidMap, payload.bids);
              applyDelta(askMap, payload.asks);
              publish(payload.totals, payload.time);
              break;
            }

            case 'l4book_unavailable':
              if (message.data.coin.toLowerCase() !== coin.toLowerCase()) return;
              resetBook();
              set({ status: 'unavailable', bids: [], asks: [], totals: null });
              break;

            case 'error':
              set({ status: 'error', error: message.error });
              break;

            default:
              break;
          }
        },

        onClose: () => {
          // Keep the last ladder on screen while reconnecting rather than
          // flashing an empty book.
          if (get().status === 'live') set({ status: 'connecting' });
        },

        onReconnectFailed: () => {
          set({ status: 'error', error: 'Order book connection lost' });
        },
      });

      client.connect();
    },

    disconnect: () => {
      if (client) {
        if (currentCoin) {
          client.send({ method: 'unsubscribe', subscription: { type: 'l4book', coin: currentCoin } });
        }
        client.disconnect();
        client = null;
      }
      currentCoin = null;
      resetBook();
      set({
        coin: null,
        status: 'idle',
        bids: [],
        asks: [],
        totals: null,
        depth: 0,
        lastUpdate: null,
        error: null,
      });
    },
  };
});
