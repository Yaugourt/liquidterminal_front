import { create } from 'zustand';
import { 
  DexMarketData, 
  AssetMarketData,
  AllDexsAssetCtxsMessage,
  AssetMarketCtx
} from './types';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 2000;

interface PerpDexMarketDataStore {
  marketData: Map<string, DexMarketData>;
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connect: () => void;
  disconnect: () => void;
  getMarketData: (dexName: string) => DexMarketData | undefined;
  getAllMarketData: () => DexMarketData[];
}

/**
 * Parse a single asset context to market data
 * Note: openInterest from API is in contracts/units, we multiply by markPx to get USD value
 */
const parseAssetCtx = (ctx: AssetMarketCtx, index: number): AssetMarketData => {
  const markPx = parseFloat(ctx.markPx) || 0;
  const prevDayPx = parseFloat(ctx.prevDayPx) || 0;
  const priceChange24h = prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : 0;
  
  // OI from API is in units/contracts, convert to USD
  const openInterestUnits = parseFloat(ctx.openInterest) || 0;
  const openInterestUsd = openInterestUnits * markPx;

  return {
    assetName: `asset_${index}`, // Will be matched with metadata
    markPx,
    midPx: ctx.midPx ? parseFloat(ctx.midPx) : null,
    oraclePx: parseFloat(ctx.oraclePx) || 0,
    funding: parseFloat(ctx.funding) || 0,
    openInterest: openInterestUsd, // Now in USD
    prevDayPx,
    dayNtlVlm: parseFloat(ctx.dayNtlVlm) || 0,
    dayBaseVlm: parseFloat(ctx.dayBaseVlm) || 0,
    premium: ctx.premium ? parseFloat(ctx.premium) : null,
    priceChange24h
  };
};

/**
 * Parse DEX asset contexts to DexMarketData
 */
const parseDexCtx = (dexName: string, assetCtxs: AssetMarketCtx[]): DexMarketData => {
  const assets = assetCtxs.map((ctx, index) => parseAssetCtx(ctx, index));
  
  const totalVolume24h = assets.reduce((sum, a) => sum + a.dayNtlVlm, 0);
  const totalOpenInterest = assets.reduce((sum, a) => sum + a.openInterest, 0);

  return {
    dexName,
    assets,
    totalVolume24h,
    totalOpenInterest
  };
};

export const usePerpDexMarketDataStore = create<PerpDexMarketDataStore>((set, get) => {
  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimeout: NodeJS.Timeout | null = null;

  return {
    marketData: new Map(),
    isConnected: false,
    error: null,
    lastUpdate: null,

    connect: () => {
      // SSR protection
      if (typeof window === 'undefined') return;

      // Don't create multiple connections
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

      // Clear pending reconnect
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          reconnectAttempts = 0;
          set({ isConnected: true, error: null });

          // Subscribe to all DEX asset contexts only if still connected
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              method: "subscribe",
              subscription: { type: "allDexsAssetCtxs" }
            }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.channel === 'allDexsAssetCtxs') {
              const data = message as AllDexsAssetCtxsMessage;
              const newMarketData = new Map<string, DexMarketData>();

              data.data.ctxs.forEach(([dexName, assetCtxs]) => {
                // Skip empty dex name (native perps)
                if (!dexName) return;
                
                const dexData = parseDexCtx(dexName, assetCtxs);
                newMarketData.set(dexName, dexData);
              });

              set({ 
                marketData: newMarketData,
                lastUpdate: new Date()
              });
            }
          } catch {
            // Silent parse error
          }
        };

        ws.onerror = () => {
          // Let onclose handle reconnection
        };

        ws.onclose = (event) => {
          set({ isConnected: false });

          // Reconnect with exponential backoff
          if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);

            reconnectTimeout = setTimeout(() => {
              get().connect();
            }, delay);
          } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            set({ error: 'Failed to connect after multiple attempts' });
          }
        };
      } catch {
        set({ error: 'Failed to establish WebSocket connection', isConnected: false });
      }
    },

    disconnect: () => {
      if (typeof window === 'undefined') return;

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      if (ws) {
        ws.close(1000, 'Manual disconnect');
        ws = null;
      }

      reconnectAttempts = 0;
      set({ 
        isConnected: false, 
        error: null,
        marketData: new Map()
      });
    },

    getMarketData: (dexName: string) => {
      return get().marketData.get(dexName.toLowerCase());
    },

    getAllMarketData: () => {
      return Array.from(get().marketData.values());
    }
  };
});

