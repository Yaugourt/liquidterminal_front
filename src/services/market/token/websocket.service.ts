import { create } from 'zustand';
import {
  TokenWebSocketStore,
  TokenTradeResponse,
  TokenOrderBookResponse,
  TokenAssetCtx,
  TokenAssetCtxResponse,
} from './types';
import { WebSocketClient, PING_HEARTBEAT } from '@/lib/websocket-client';
import { mergeTrades, newestTrade } from '@/lib/hl-trades';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000;

const ctxNumber = (value: string | undefined): number | null => {
  if (value == null) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Same stats: the ~1/s frame is mostly unchanged, so skip the store write. */
const sameAssetCtx = (a: TokenAssetCtx | null, b: TokenAssetCtx): boolean =>
  a !== null &&
  a.coin === b.coin &&
  a.markPx === b.markPx &&
  a.prevDayPx === b.prevDayPx &&
  a.dayNtlVlm === b.dayNtlVlm &&
  a.oraclePx === b.oraclePx &&
  a.premium === b.premium &&
  a.funding === b.funding &&
  a.openInterest === b.openInterest;
/** Trades kept for the Recent Trades lists, newest first. */
const MAX_TRADES = 50;

export const useTokenWebSocketStore = create<TokenWebSocketStore>((set, get) => {
  let client: WebSocketClient | null = null;
  let resetTimeout: NodeJS.Timeout | null = null;
  let currentCoinId: string | null = null;
  // TokenCard, TradingViewChart, OrderBook and RecentTrades share this socket;
  // one unmounting (e.g. a chart toggle) must not freeze the others.
  let refCount = 0;

  return {
    currentPrice: 0,
    lastSide: null,
    assetCtx: null,
    orderBook: {
      bids: [],
      asks: []
    },
    trades: [],
    isConnected: false,
    error: null,

    connect: (coinId: string) => {
      // SSR protection - WebSocket only works in browser
      if (typeof window === 'undefined') {
        return;
      }
      // Counted before validation so every connect() pairs with one disconnect().
      refCount++;

      // Validate coinId
      if (!coinId || coinId.trim() === '') {
        set({ error: 'Invalid coin ID' });
        return;
      }

      // Same coin: reuse the existing client. connect() is idempotent while the
      // socket is OPEN/CONNECTING and reconnects if it has closed. This subsumes
      // the previous "already connected" and "isConnecting" guards.
      if (client && currentCoinId === coinId) {
        client.connect();
        return;
      }

      // Switching tokens: tear down the previous connection and reset state.
      if (client) {
        client.disconnect();
        client = null;
        set({
          isConnected: false,
          currentPrice: 0,
          lastSide: null,
          assetCtx: null,
          orderBook: { bids: [], asks: [] },
          trades: []
        });
      }

      currentCoinId = coinId;

      client = new WebSocketClient({
        url: WS_URL,
        maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
        baseReconnectDelay: RECONNECT_DELAY,
        // An illiquid coin's channels can stay quiet past Hyperliquid's 60 s
        // idle cut-off.
        heartbeat: PING_HEARTBEAT,
        onOpen: () => {
          set({ isConnected: true, error: null });

          // Subscribe to trades
          client?.send({
            method: 'subscribe',
            subscription: { type: 'trades', coin: coinId }
          });

          // Subscribe to order book (l2Book)
          client?.send({
            method: 'subscribe',
            subscription: { type: 'l2Book', coin: coinId }
          });

          // 24h stats of the coin (change, volume, and for a perp oracle,
          // premium, funding, OI): ~1 frame/s, ~0.4 KB. A spot coin answers
          // on activeSpotAssetCtx.
          client?.send({
            method: 'subscribe',
            subscription: { type: 'activeAssetCtx', coin: coinId }
          });
        },
        onMessage: (data) => {
          try {
            const message = data as TokenTradeResponse;

            if (message.channel === 'trades' && Array.isArray(message.data)) {
              // Every trade of the frame, not just the first (the oldest).
              const batch = message.data;
              const newest = newestTrade(batch);
              let added = false;

              set((state) => {
                const trades = mergeTrades(state.trades, batch, MAX_TRADES);
                // A replayed snapshot after a reconnect: nothing new.
                if (trades === state.trades || !newest) return state;
                added = true;
                return {
                  currentPrice: parseFloat(newest.px),
                  lastSide: newest.side,
                  trades,
                };
              });

              if (added) {
                // Reset price animation after 2 seconds
                if (resetTimeout) {
                  clearTimeout(resetTimeout);
                }
                resetTimeout = setTimeout(() => {
                  set({ lastSide: null });
                }, 2000);
              }
            }

            if (message.channel === 'activeAssetCtx' || message.channel === 'activeSpotAssetCtx') {
              const { coin, ctx } = (data as TokenAssetCtxResponse).data ?? {};
              if (coin !== coinId || !ctx) return;
              const markPx = ctxNumber(ctx.markPx);
              const prevDayPx = ctxNumber(ctx.prevDayPx);
              const dayNtlVlm = ctxNumber(ctx.dayNtlVlm);
              if (markPx === null || prevDayPx === null || dayNtlVlm === null) return;
              const next: TokenAssetCtx = {
                coin,
                markPx,
                prevDayPx,
                dayNtlVlm,
                oraclePx: ctxNumber(ctx.oraclePx),
                premium: ctxNumber(ctx.premium),
                funding: ctxNumber(ctx.funding),
                openInterest: ctxNumber(ctx.openInterest),
              };
              if (!sameAssetCtx(get().assetCtx, next)) set({ assetCtx: next });
              return;
            }

            if (message.channel === 'l2Book') {
              const orderBookData = data as TokenOrderBookResponse;
              const { levels } = orderBookData.data;

              if (levels && levels.length >= 2) {
                const bids = levels[0] || []; // Buy orders (index 0)
                const asks = levels[1] || []; // Sell orders (index 1)

                set({
                  orderBook: {
                    bids: bids.slice(0, 20), // Keep top 20 levels
                    asks: asks.slice(0, 20)
                  }
                });
              }
            }
          } catch {
            set({ error: 'Failed to parse WebSocket data' });
          }
        },
        onClose: () => {
          set({
            isConnected: false,
            error: null
          });
        },
        onReconnectFailed: () => {
          set({ error: 'WebSocket connection failed after multiple attempts' });
          currentCoinId = null;
        }
      });

      client.connect();
    },

    disconnect: () => {
      refCount = Math.max(0, refCount - 1);
      if (refCount > 0) return;

      if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }

      if (client) {
        client.disconnect();
        client = null;
      }

      currentCoinId = null;
      set({
        isConnected: false,
        error: null,
        currentPrice: 0,
        lastSide: null,
        assetCtx: null,
        orderBook: { bids: [], asks: [] },
        trades: []
      });
    },

    resetPriceAnimation: () => {
      set({ lastSide: null });
    }
  };
});
