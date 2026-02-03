import { create } from 'zustand';
import { env } from '@/lib/env';
import { WebSocketClient } from '@/services/core/WebSocketClient';
import { 
  Liquidation, 
  LiquidationWSStore, 
  LiquidationWSFilters,
  LiquidationWSMessage 
} from './types';

// Construit l'URL WebSocket à partir de NEXT_PUBLIC_API
// http://localhost:3002 -> ws://localhost:3002/ws
// https://api.example.com -> wss://api.example.com/ws
const buildWSUrl = (): string => {
  const apiUrl = env.NEXT_PUBLIC_API;
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  const baseUrl = apiUrl.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${baseUrl}/ws`;
};

const WS_URL = buildWSUrl();
const MAX_RECENT_ITEMS = 100;

export const useLiquidationWSStore = create<LiquidationWSStore>((set, get) => {
  let client: WebSocketClient | null = null;

  return {
    // État initial
    isConnected: false,
    isSubscribed: false,
    error: null,
    recentLiquidations: [],
    filters: {},
    onLiquidation: undefined,

    connect: () => {
      // Éviter les doubles connexions
      if (client?.isConnected()) return;

      client = new WebSocketClient({
        url: WS_URL,
        debug: process.env.NODE_ENV === 'development',
        maxReconnectAttempts: 10,
        baseReconnectDelay: 1000,

        onOpen: () => {
          set({ isConnected: true, error: null });
        },

        onMessage: (data: unknown) => {
          const message = data as LiquidationWSMessage;

          switch (message.type) {
            case 'connected':
              // Envoyer la subscription avec les filtres actuels
              client?.send({
                method: 'subscribe',
                subscription: {
                  type: 'liquidation',
                  filters: get().filters
                }
              });
              break;

            case 'subscribed':
              set({ isSubscribed: true });
              break;

            case 'liquidation':
              if (message.data && 'tid' in message.data) {
                const liq = message.data as Liquidation;
                
                // Ajouter à la liste (en tête, limiter la taille)
                set((state) => ({
                  recentLiquidations: [liq, ...state.recentLiquidations].slice(0, MAX_RECENT_ITEMS)
                }));

                // Appeler le callback externe si défini
                const callback = get().onLiquidation;
                if (callback) {
                  callback(liq);
                }
              }
              break;

            case 'heartbeat':
              // Ping/pong - rien à faire
              break;

            case 'error':
              set({ error: message.error || 'Unknown WebSocket error' });
              break;
          }
        },

        onClose: () => {
          set({ isConnected: false, isSubscribed: false });
        },

        onError: () => {
          set({ error: 'WebSocket connection error' });
        }
      });

      client.connect();
    },

    disconnect: () => {
      if (client) {
        client.disconnect();
        client = null;
      }
      set({ 
        isConnected: false, 
        isSubscribed: false, 
        error: null 
      });
    },

    updateFilters: (filters: LiquidationWSFilters) => {
      set({ filters });
      
      // Si connecté, renvoyer la subscription avec les nouveaux filtres
      if (client?.isConnected()) {
        client.send({
          method: 'subscribe',
          subscription: {
            type: 'liquidation',
            filters
          }
        });
      }
    },

    clearLiquidations: () => {
      set({ recentLiquidations: [] });
    },

    setOnLiquidation: (callback) => {
      set({ onLiquidation: callback });
    }
  };
});
