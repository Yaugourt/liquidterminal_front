import { create } from 'zustand';
import {  HypePriceStore, HypeTradeResponse } from './types';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const HYPE_COIN_ID = '@107';

export const useHypePriceStore = create<HypePriceStore>((set) => {
  let resetTimeout: NodeJS.Timeout | null = null;

  return {
    currentPrice: 0,
    lastSide: null,
    isConnected: false,
    error: null,

    connect: () => {
      try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
    
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
          } catch (error) {
            console.error('Error parsing HYPE WebSocket message:', error);
            set({ error: 'Failed to parse HYPE price data' });
          }
        };

        ws.onerror = (error) => {
          console.error('HYPE WebSocket error:', error);
          set({ error: 'HYPE WebSocket connection error', isConnected: false });
        };

        ws.onclose = () => {
    
          set({ isConnected: false });
          
          // Try to reconnect after 5 seconds
          setTimeout(() => {
            if ((window as any).hypePriceWs === ws) {
              useHypePriceStore.getState().connect();
            }
          }, 5000);
        };

        // Store WebSocket instance
        (window as any).hypePriceWs = ws;
      } catch (error) {
        console.error('Failed to create HYPE WebSocket:', error);
        set({ error: 'Failed to connect to HYPE WebSocket', isConnected: false });
      }
    },

    disconnect: () => {
      const ws = (window as any).hypePriceWs;
      if (ws) {
        ws.close();
        (window as any).hypePriceWs = null;
        set({ isConnected: false });
      }
      // Clear any existing timeout
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