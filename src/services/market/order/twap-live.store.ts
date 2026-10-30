import { create } from 'zustand';
import { env } from '@/lib/env';
import { WebSocketClient, PING_HEARTBEAT, HIDDEN_TAB_PAUSE_MS } from '@/lib/websocket-client';
import type { TwapLiveEntry, TwapLiveMessage, TwapLivePatch, TwapLiveStore } from './types';

// NEXT_PUBLIC_API http://localhost:3002 -> ws://localhost:3002/ws (same builder as the liquidation store)
const buildWSUrl = (): string => {
  const apiUrl = env.NEXT_PUBLIC_API;
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  const baseUrl = apiUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return `${wsProtocol}://${baseUrl}/ws`;
};

const WS_URL = buildWSUrl();

/** After the feed stops being fresh, its verdicts (exact, stalled, totals) hold this long: a short socket drop must not flicker them. */
export const TWAP_FRESH_GRACE_MS = 30_000;

type FreshState = Pick<TwapLiveStore, 'isConnected' | 'isSubscribed' | 'upstream'>;

/** Connected and subscribed with the upstream up, right now. */
export const isTwapLiveUp = (s: FreshState): boolean => s.isConnected && s.isSubscribed && s.upstream?.connected === true;

/** The feed was fresh less than `TWAP_FRESH_GRACE_MS` ago. */
export const isWithinFreshGrace = (lastFreshAt: number | null, now: number = Date.now()): boolean =>
  lastFreshAt !== null && now - lastFreshAt < TWAP_FRESH_GRACE_MS;

/**
 * Executed amounts can be trusted as fresh: the feed is up, or it was less
 * than `TWAP_FRESH_GRACE_MS` ago. Time moves without any store update, so
 * callers that need the grace to expire schedule their own re-check (see
 * useTwapLive). Before the first snapshot nothing was ever fresh.
 */
export const isTwapLiveFresh = (s: FreshState & Pick<TwapLiveStore, 'lastFreshAt'>, now: number = Date.now()): boolean =>
  isTwapLiveUp(s) || isWithinFreshGrace(s.lastFreshAt, now);

/**
 * `lastFreshAt` after a transition: stamped now while the feed is up and at
 * the moment it stops being up, kept as it was while it stays down.
 */
const stampFresh = (prev: TwapLiveStore, next: FreshState): number | null =>
  isTwapLiveUp(next) || isTwapLiveUp(prev) ? Date.now() : prev.lastFreshAt;

/** A patch on top of what is known (nothing known: the progress fields default to zero). */
function applyPatch(prev: TwapLiveEntry | undefined, patch: TwapLivePatch): TwapLiveEntry {
  return {
    executedSz: 0,
    executedNtl: 0,
    fills: 0,
    lastFillAt: null,
    lastPx: null,
    exact: false,
    ...prev,
    ...patch,
  };
}

/**
 * Live TWAP book, pushed by the backend's `twap` channel: a snapshot on
 * subscribe, then one delta per second at most. The data layer merges it over
 * the polled list (twap-source.ts), which stays the base and the fallback.
 *
 * Ref-counted like the liquidation store: every widget that reads TWAPs holds
 * it, one socket per tab. Every subscribe brings a fresh snapshot, so a
 * background tab can close the socket (pauseWhenHidden) and lose nothing.
 */
export const useTwapLiveStore = create<TwapLiveStore>((set) => {
  let client: WebSocketClient | null = null;
  let refCount = 0;

  return {
    isConnected: false,
    isSubscribed: false,
    upstream: null,
    unsupported: false,
    entries: new Map(),
    version: 0,
    updatedAt: null,
    lastFreshAt: null,

    connect: () => {
      refCount++;

      // connect() is a no-op while OPEN/CONNECTING.
      if (client) {
        client.connect();
        return;
      }

      client = new WebSocketClient({
        url: WS_URL,
        debug: process.env.NODE_ENV === 'development',
        maxReconnectAttempts: 10,
        baseReconnectDelay: 1000,
        heartbeat: PING_HEARTBEAT,
        pauseWhenHidden: HIDDEN_TAB_PAUSE_MS,

        onOpen: () => {
          set({ isConnected: true });
        },

        // One store update per message: the memos downstream rerun once.
        onMessage: (data: unknown) => {
          const message = data as TwapLiveMessage;

          switch (message.type) {
            case 'connected':
              // Sent on every new connection, so a reconnect retries a subscribe the backend refused.
              set({ unsupported: false });
              client?.send({ method: 'subscribe', subscription: { type: 'twap' } });
              break;

            case 'subscribed':
              set({ isSubscribed: true });
              break;

            case 'twap_snapshot': {
              const { entries, upstream } = message.data;
              const next = new Map<number, TwapLiveEntry>();
              for (const patch of entries) next.set(patch.twapId, applyPatch(undefined, patch));
              set((state) => ({
                entries: next,
                upstream,
                version: state.version + 1,
                updatedAt: Date.now(),
                lastFreshAt: stampFresh(state, { ...state, upstream }),
              }));
              break;
            }

            case 'twap_delta': {
              const { entries, removed, upstream } = message.data;
              set((state) => {
                const next = new Map(state.entries);
                // Removals first: an id removed and sent again in the same delta stays.
                for (const id of removed) next.delete(id);
                // Patches merge field-wise; a progress-only patch for an unknown TWAP waits here until a polled row appears.
                for (const patch of entries) next.set(patch.twapId, applyPatch(next.get(patch.twapId), patch));
                return {
                  entries: next,
                  upstream,
                  version: state.version + 1,
                  updatedAt: Date.now(),
                  lastFreshAt: stampFresh(state, { ...state, upstream }),
                };
              });
              break;
            }

            case 'error':
              // A backend deployed before the channel answers the subscribe with INVALID_SUBSCRIPTION:
              // stay idle (the polled list carries on); the next reconnect tries again.
              if (message.code === 'INVALID_SUBSCRIPTION') {
                set((state) => ({
                  unsupported: true,
                  isSubscribed: false,
                  lastFreshAt: stampFresh(state, { ...state, isSubscribed: false }),
                }));
              }
              break;

            case 'heartbeat':
              break;
          }
        },

        onClose: () => {
          // The book is kept (statuses of ended TWAPs stay valid), but nothing in it is fresh any more
          // (readers still trust it for TWAP_FRESH_GRACE_MS after the last fresh moment).
          set((state) => ({
            isConnected: false,
            isSubscribed: false,
            upstream: null,
            lastFreshAt: stampFresh(state, { isConnected: false, isSubscribed: false, upstream: null }),
          }));
        },
      });

      client.connect();
    },

    disconnect: () => {
      refCount = Math.max(0, refCount - 1);
      if (refCount > 0) return;

      if (client) {
        client.disconnect();
        client = null;
      }
      set((state) => ({
        isConnected: false,
        isSubscribed: false,
        upstream: null,
        unsupported: false,
        entries: new Map(),
        version: state.version + 1,
        updatedAt: null,
        lastFreshAt: null,
      }));
    },
  };
});
