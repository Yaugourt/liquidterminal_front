import { create } from 'zustand';
import { HypePriceStore, HypeSpotCtxResponse, HypeTradeResponse } from './types';
import { WebSocketClient, HIDDEN_TAB_PAUSE_MS, PING_HEARTBEAT } from '@/lib/websocket-client';
import { newestTrade } from '@/lib/hl-trades';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const HYPE_COIN_ID = '@107';
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 2000;

export const useHypePriceStore = create<HypePriceStore>((set, get) => {
  // The client lives in the store singleton closure, so the socket is
  // intentionally kept alive across component unmounts (the consuming hook
  // never disconnects). This replaces the previous `window.hypePriceWs` global.
  let client: WebSocketClient | null = null;
  let resetTimeout: NodeJS.Timeout | null = null;
  /** Trade the displayed price comes from. */
  let lastTid: number | null = null;

  return {
    currentPrice: 0,
    markPx: 0,
    prevDayPx: 0,
    lastSide: null,
    isConnected: false,
    error: null,

    connect: () => {
      // SSR protection - WebSocket only works in browser
      if (typeof window === 'undefined') return;

      // Reuse the shared connection: connect() is a no-op while the socket is
      // OPEN/CONNECTING and reconnects if it has closed.
      if (!client) {
        client = new WebSocketClient({
          url: WS_URL,
          maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
          baseReconnectDelay: BASE_RECONNECT_DELAY,
          // Only the latest trade price and asset context are kept: pausing
          // loses nothing.
          pauseWhenHidden: HIDDEN_TAB_PAUSE_MS,
          heartbeat: PING_HEARTBEAT,
          onOpen: () => {
            set({ isConnected: true, error: null });

            // Subscribe to HYPE trades
            client?.send({
              method: 'subscribe',
              subscription: { type: 'trades', coin: HYPE_COIN_ID }
            });
            // Mark and previous-day prices (~350 B/s), for the 24h change
            client?.send({
              method: 'subscribe',
              subscription: { type: 'activeAssetCtx', coin: HYPE_COIN_ID }
            });
          },
          onMessage: (data) => {
            const response = data as HypeTradeResponse;

            if (response.channel === 'activeSpotAssetCtx') {
              const { coin, ctx } = (data as HypeSpotCtxResponse).data ?? {};
              if (coin !== HYPE_COIN_ID || !ctx) return;
              const markPx = parseFloat(ctx.markPx ?? '');
              const prevDayPx = parseFloat(ctx.prevDayPx ?? '');
              // One frame per second, mostly unchanged: write only what moved.
              const state = get();
              if (
                Number.isFinite(markPx) &&
                Number.isFinite(prevDayPx) &&
                (markPx !== state.markPx || prevDayPx !== state.prevDayPx)
              ) {
                set({ markPx, prevDayPx });
              }
              return;
            }

            // Check if it's a trade message and contains data
            if (response.channel === 'trades' && Array.isArray(response.data)) {
              // The frame's latest trade: data[0] is its oldest.
              const trade = newestTrade(response.data);

              // Make sure it's for HYPE, and skip the snapshot a reconnect
              // replays when nothing traded in between.
              if (trade && trade.coin === HYPE_COIN_ID && trade.tid !== lastTid) {
                lastTid = trade.tid;
                // Clear any existing timeout
                if (resetTimeout) {
                  clearTimeout(resetTimeout);
                }

                set({
                  currentPrice: parseFloat(trade.px),
                  lastSide: trade.side
                });

                // Set new timeout
                resetTimeout = setTimeout(() => {
                  set({ lastSide: null });
                }, 1000);
              }
            }
          },
          onClose: () => {
            set({ isConnected: false });
          },
          onReconnectFailed: () => {
            set({ error: 'WebSocket connection failed after multiple attempts' });
          }
        });
      }

      client.connect();
    },

    disconnect: () => {
      // SSR protection
      if (typeof window === 'undefined') return;

      if (client) {
        client.disconnect();
        client = null;
        set({ isConnected: false, error: null });
      }

      // Clear timeouts
      if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }
    },

    resetPriceAnimation: () => {
      set({ lastSide: null });
    }
  };
});
