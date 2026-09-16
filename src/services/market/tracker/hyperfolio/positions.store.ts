import { create } from 'zustand';
import {
  buildPositionsStreamUrl,
  classifyHyperfolioError,
  fetchDefiPositions,
  normalizePortfolioStats,
  normalizeProtocol,
} from './api';
import type { DefiPositionsState, DefiProtocol, RawStreamEvent } from './types';

/**
 * Shared DeFi-positions feed, one SSE connection per wallet regardless of how
 * many panels read it (balance cards + the HyperEVM block). Protocols arrive
 * one by one from the backend proxy; if the stream fails before completion
 * the store falls back to the blocking `/positions` JSON route.
 *
 * Mirrors `services/explorer/liquidation/websocket.store.ts` (zustand-owned
 * connection with refcounted subscribers) — SSE instead of WebSocket.
 */

interface Connection {
  source: EventSource | null;
  subscribers: number;
  completed: boolean;
  fallback: Promise<void> | null;
}

interface DefiPositionsStore {
  wallets: Record<string, DefiPositionsState>;
  subscribe: (address: string) => () => void;
  refresh: (address: string) => void;
}

const EMPTY_STATE: DefiPositionsState = {
  status: 'idle',
  protocols: [],
  progress: null,
  stats: null,
  error: null,
  updatedAt: null,
  source: null,
};

const connections = new Map<string, Connection>();

const key = (address: string): string => address.toLowerCase();

export const useDefiPositionsStore = create<DefiPositionsStore>((set, get) => {
  const patch = (address: string, next: Partial<DefiPositionsState>): void => {
    const k = key(address);
    set((state) => ({
      wallets: { ...state.wallets, [k]: { ...(state.wallets[k] ?? EMPTY_STATE), ...next } },
    }));
  };

  const closeSource = (conn: Connection): void => {
    if (conn.source) {
      conn.source.close();
      conn.source = null;
    }
  };

  const fallbackToJson = (address: string): void => {
    const conn = connections.get(key(address));
    if (!conn || conn.completed || conn.fallback) return;
    closeSource(conn);
    patch(address, { status: 'streaming', source: 'json', progress: null });
    conn.fallback = fetchDefiPositions(address)
      .then(({ protocols, stats }) => {
        conn.completed = true;
        patch(address, {
          status: 'complete',
          protocols: sortProtocols(protocols),
          stats,
          progress: { completed: protocols.length, total: protocols.length },
          error: null,
          updatedAt: Date.now(),
          source: 'json',
        });
      })
      .catch((error: unknown) => {
        const kind = classifyHyperfolioError(error);
        const message = (error as { message?: string })?.message ?? 'Failed to load DeFi positions';
        patch(address, {
          status: kind === 'rate-limited' ? 'rate-limited' : 'error',
          error: kind === 'not-configured' ? 'HyperEVM data is not configured on this instance' : message,
        });
      })
      .finally(() => {
        conn.fallback = null;
      });
  };

  const open = (address: string): void => {
    const k = key(address);
    const conn = connections.get(k);
    if (!conn || conn.source || conn.fallback) return;

    if (typeof EventSource === 'undefined') {
      fallbackToJson(address);
      return;
    }

    patch(address, { ...EMPTY_STATE, status: 'streaming', source: 'stream' });
    const received = new Map<string, DefiProtocol>();
    const source = new EventSource(buildPositionsStreamUrl(address));
    conn.source = source;
    conn.completed = false;

    source.onmessage = (event: MessageEvent<string>) => {
      let payload: RawStreamEvent;
      try {
        payload = JSON.parse(event.data) as RawStreamEvent;
      } catch {
        return;
      }
      if (payload.type === 'protocol') {
        const protocol = normalizeProtocol(payload.data);
        received.set(protocol.id, protocol);
        patch(address, {
          protocols: sortProtocols(Array.from(received.values())),
          progress: payload.progress,
        });
        return;
      }
      if (payload.type === 'error') {
        if (payload.fatal) {
          // Proxy lost the upstream mid-way: complete from the JSON route.
          fallbackToJson(address);
        } else if (payload.progress) {
          patch(address, { progress: payload.progress });
        }
        return;
      }
      if (payload.type === 'complete') {
        conn.completed = true;
        closeSource(conn);
        patch(address, {
          status: 'complete',
          progress: payload.progress,
          stats: payload.portfolioStats ? normalizePortfolioStats(payload.portfolioStats) : null,
          updatedAt: Date.now(),
          error: null,
        });
      }
    };

    source.onerror = () => {
      // EventSource hides the HTTP status (429/503 JSON answers land here too);
      // the JSON route reports the real reason.
      if (!conn.completed) fallbackToJson(address);
    };
  };

  return {
    wallets: {},

    subscribe: (address: string) => {
      const k = key(address);
      let conn = connections.get(k);
      if (!conn) {
        conn = { source: null, subscribers: 0, completed: false, fallback: null };
        connections.set(k, conn);
      }
      conn.subscribers += 1;
      const current = get().wallets[k];
      if (!current || current.status === 'idle') {
        open(address);
      }
      return () => {
        const c = connections.get(k);
        if (!c) return;
        c.subscribers -= 1;
        if (c.subscribers <= 0) {
          closeSource(c);
          connections.delete(k);
          // Keep the data in the store so a remount is instant; only the
          // connection is torn down.
        }
      };
    },

    refresh: (address: string) => {
      const k = key(address);
      const conn = connections.get(k);
      if (!conn || conn.source || conn.fallback) return;
      conn.completed = false;
      open(address);
    },
  };
});

const sortProtocols = (protocols: DefiProtocol[]): DefiProtocol[] =>
  [...protocols].sort((a, b) => b.totalValue - a.totalValue || a.name.localeCompare(b.name));

export const selectWallet = (address: string) => (state: DefiPositionsStore): DefiPositionsState =>
  state.wallets[key(address)] ?? EMPTY_STATE;
