import { create } from 'zustand';
import {
  TokenWebSocketStore,
  TokenTradeResponse,
  TokenOrderBookResponse,
} from './types';
import { WebSocketClient } from '@/lib/websocket-client';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000;

export const useTokenWebSocketStore = create<TokenWebSocketStore>((set) => {
  let client: WebSocketClient | null = null;
  let resetTimeout: NodeJS.Timeout | null = null;
  let currentCoinId: string | null = null;

  return {
    currentPrice: 0,
    lastSide: null,
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
          orderBook: { bids: [], asks: [] },
          trades: []
        });
      }

      currentCoinId = coinId;

      client = new WebSocketClient({
        url: WS_URL,
        maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
        baseReconnectDelay: RECONNECT_DELAY,
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
        },
        onMessage: (data) => {
          try {
            const message = data as TokenTradeResponse;

            if (message.channel === 'trades') {
              const latestTrade = message.data[0];

              if (latestTrade) {
                const price = parseFloat(latestTrade.px);

                set((state) => ({
                  currentPrice: price,
                  lastSide: latestTrade.side,
                  trades: [latestTrade, ...state.trades.slice(0, 49)] // Keep last 50 trades
                }));

                // Reset price animation after 2 seconds
                if (resetTimeout) {
                  clearTimeout(resetTimeout);
                }
                resetTimeout = setTimeout(() => {
                  set({ lastSide: null });
                }, 2000);
              }
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
        orderBook: { bids: [], asks: [] },
        trades: []
      });
    },

    resetPriceAnimation: () => {
      set({ lastSide: null });
    }
  };
});
