import { create } from 'zustand';
import {  HypePriceStore, HypeTradeResponse, HypeWebSocketWindow } from './types';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const HYPE_COIN_ID = '@107';
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 2000;

export const useHypePriceStore = create<HypePriceStore>((set, get) => {
  let resetTimeout: NodeJS.Timeout | null = null;
  let reconnectAttempts = 0;
  let reconnectTimeout: NodeJS.Timeout | null = null;

  return {
    currentPrice: 0,
    lastSide: null,
    isConnected: false,
    error: null,

    connect: () => {
      // SSR protection - WebSocket only works in browser
      if (typeof window === 'undefined') {
        return;
      }

      // Don't create multiple connections
      const existingWs = (window as HypeWebSocketWindow).hypePriceWs;
      if (existingWs && existingWs.readyState === WebSocket.OPEN) {
        return;
      }

      // Clear any pending reconnect
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          reconnectAttempts = 0; // Reset on successful connection
          set({ isConnected: true, error: null });
          
          // Subscribe to HYPE trades
          ws.send(JSON.stringify({
            method: "subscribe",
            subscription: { type: "trades", coin: HYPE_COIN_ID }
          }));
        };

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data) as HypeTradeResponse;
            
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
          } catch {
            // Silent error handling - don't spam error state
          }
        };

        ws.onerror = () => {
          // Silent error handling - onclose will handle reconnection
        };

        ws.onclose = (event) => {
          set({ isConnected: false });
          
          // Only reconnect if not manually closed and under max attempts
          if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);
            
            reconnectTimeout = setTimeout(() => {
              // Only reconnect if this is still the current ws instance
              if ((window as HypeWebSocketWindow).hypePriceWs === ws || 
                  !(window as HypeWebSocketWindow).hypePriceWs) {
                get().connect();
              }
            }, delay);
          } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            set({ error: 'WebSocket connection failed after multiple attempts' });
          }
        };

        // Store WebSocket instance
        (window as HypeWebSocketWindow).hypePriceWs = ws;
      } catch {
        // Silent error handling
        set({ error: 'Failed to connect to HYPE WebSocket', isConnected: false });
      }
    },

    disconnect: () => {
      // SSR protection
      if (typeof window === 'undefined') return;
      
      const ws = (window as HypeWebSocketWindow).hypePriceWs;
      if (ws) {
        ws.close(1000, 'Manual disconnect'); // Normal closure code
        (window as HypeWebSocketWindow).hypePriceWs = undefined;
        set({ isConnected: false, error: null });
      }
      // Clear timeouts
      if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      reconnectAttempts = 0;
    },

    resetPriceAnimation: () => {
      set({ lastSide: null });
    }
  };
}); 