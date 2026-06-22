import { create } from 'zustand';
import { HypePriceStore, HypeTradeResponse } from './types';
import { WebSocketClient } from '@/lib/websocket-client';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const HYPE_COIN_ID = '@107';
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 2000;

export const useHypePriceStore = create<HypePriceStore>((set) => {
  // The client lives in the store singleton closure, so the socket is
  // intentionally kept alive across component unmounts (the consuming hook
  // never disconnects). This replaces the previous `window.hypePriceWs` global.
  let client: WebSocketClient | null = null;
  let resetTimeout: NodeJS.Timeout | null = null;

  return {
    currentPrice: 0,
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
          onOpen: () => {
            set({ isConnected: true, error: null });

            // Subscribe to HYPE trades
            client?.send({
              method: 'subscribe',
              subscription: { type: 'trades', coin: HYPE_COIN_ID }
            });
          },
          onMessage: (data) => {
            const response = data as HypeTradeResponse;

            // Check if it's a trade message and contains data
            if (response.channel === 'trades' && response.data && response.data.length > 0) {
              const trade = response.data[0];

              // Make sure it's for HYPE
              if (trade.coin === HYPE_COIN_ID) {
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
