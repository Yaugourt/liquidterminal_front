import { create } from 'zustand';
import { 
  TokenWebSocketStore, 
  TokenTradeResponse, 
  TokenOrderBookResponse,
} from './types';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';

export const useTokenWebSocketStore = create<TokenWebSocketStore>((set, get) => {
  let ws: WebSocket | null = null;
  let resetTimeout: NodeJS.Timeout | null = null;
  let currentCoinId: string | null = null;
  let isConnecting = false;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 2000;

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

      // If already connected to the same coin, don't reconnect
      if (ws && get().isConnected && currentCoinId === coinId) {
        return;
      }

      // Prevent multiple simultaneous connections
      if (isConnecting) {
        return;
      }

      // Disconnect existing connection if switching tokens
      if (ws && currentCoinId !== coinId) {
        ws.close(1000, 'Switching tokens');
        ws = null;
        currentCoinId = null;
        set({ 
          isConnected: false,
          currentPrice: 0,
          lastSide: null,
          orderBook: { bids: [], asks: [] },
          trades: []
        });
      }

      currentCoinId = coinId;
      isConnecting = true;

      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          isConnecting = false;
          reconnectAttempts = 0;
          set({ isConnected: true, error: null });
          
          // Subscribe to trades
          const tradesSubscription = {
            method: "subscribe",
            subscription: { type: "trades", coin: coinId }
          };
          ws?.send(JSON.stringify(tradesSubscription));

          // Subscribe to order book (l2Book)
          const orderBookSubscription = {
            method: "subscribe",
            subscription: { 
              type: "l2Book", 
              coin: coinId, 
            }
          };
          ws?.send(JSON.stringify(orderBookSubscription));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.channel === 'trades') {
              const tradeData = message as TokenTradeResponse;
              const latestTrade = tradeData.data[0];
              
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
              const orderBookData = message as TokenOrderBookResponse;
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
        };


        ws.onerror = () => {
          // Silent error handling - onclose will handle the reconnection
        };

        ws.onclose = (event) => {
          isConnecting = false;
          set({ 
            isConnected: false,
            error: null 
          });
          ws = null;
          
          // Auto-reconnect with exponential backoff if not manually disconnected
          if (currentCoinId && reconnectAttempts < MAX_RECONNECT_ATTEMPTS && event.code !== 1000) {
            reconnectAttempts++;
            const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);
            
            setTimeout(() => {
              if (currentCoinId && !get().isConnected) {
                get().connect(currentCoinId);
              }
            }, delay);
          } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            set({ error: 'WebSocket connection failed after multiple attempts' });
            currentCoinId = null;
            reconnectAttempts = 0;
          } else {
            currentCoinId = null;
            reconnectAttempts = 0;
          }
        };

      } catch {
        isConnecting = false;
        set({ 
          error: 'Failed to establish WebSocket connection',
          isConnected: false 
        });
      }
    },

    disconnect: () => {
      if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }
      
      if (ws) {
        ws.close(1000, 'Manual disconnect'); // Normal closure
        ws = null;
      }
      
      currentCoinId = null;
      isConnecting = false;
      reconnectAttempts = 0;
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
