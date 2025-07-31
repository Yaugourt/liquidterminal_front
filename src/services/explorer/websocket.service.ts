import { create } from 'zustand';
import { useState, useEffect } from 'react';
import { Block, Transaction, ExplorerStore } from './types';

const WS_URL = 'wss://rpc.hyperliquid.xyz/ws';

// Types pour les WebSockets
interface WebSocketWindow extends Window {
  explorerBlocksWs?: WebSocket;
  explorerTransactionsWs?: WebSocket;
}

export const useExplorerStore = create<ExplorerStore>((set, get) => ({
  blocks: [],
  transactions: [],
  isBlocksConnected: false,
  isTransactionsConnected: false,
  error: null,

  connectBlocks: () => {
    try {
      // Disconnect existing blocks connection if any
      const existingWs = (window as WebSocketWindow).explorerBlocksWs;
      if (existingWs) {
        existingWs.close();
      }

      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {

        set({ isBlocksConnected: true, error: null });
        
        // Subscribe to block updates only
        ws.send(JSON.stringify({
          method: "subscribe",
          subscription: { type: "explorerBlock" }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!Array.isArray(data) || data.length === 0) return;

          const item = data[0];
          
          // Only handle blocks
          if ('blockTime' in item) {
            get().addBlock(item);
          }
        } catch (error) {
          set({ error: 'Failed to parse blocks data' });
        }
      };

      ws.onerror = (error) => {
        set({ error: 'Blocks WebSocket connection error', isBlocksConnected: false });
      };

      ws.onclose = () => {

        set({ isBlocksConnected: false });
      };

      // Store WebSocket instance
      (window as WebSocketWindow).explorerBlocksWs = ws;
    } catch (error) {
      set({ error: 'Failed to connect to Blocks WebSocket', isBlocksConnected: false });
    }
  },

  disconnectBlocks: () => {
    const ws = (window as WebSocketWindow).explorerBlocksWs;
    if (ws) {
      ws.close();
      (window as WebSocketWindow).explorerBlocksWs = undefined;
      set({ isBlocksConnected: false });
    }
  },

  connectTransactions: () => {
    try {
      // Disconnect existing transactions connection if any
      const existingWs = (window as WebSocketWindow).explorerTransactionsWs;
      if (existingWs) {
        existingWs.close();
      }

      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {

        set({ isTransactionsConnected: true, error: null });
        
        // Subscribe to transaction updates only
        ws.send(JSON.stringify({
          method: "subscribe",
          subscription: { type: "explorerTxs" }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!Array.isArray(data) || data.length === 0) return;

          const item = data[0];
          
          // Only handle transactions
          if ('time' in item && 'action' in item) {
            get().addTransaction(item);
          }
        } catch (error) {
          set({ error: 'Failed to parse transactions data' });
        }
      };

      ws.onerror = (error) => {
        set({ error: 'Transactions WebSocket connection error', isTransactionsConnected: false });
      };

      ws.onclose = () => {

        set({ isTransactionsConnected: false });
      };

      // Store WebSocket instance
      (window as WebSocketWindow).explorerTransactionsWs = ws;
    } catch (error) {
      set({ error: 'Failed to connect to Transactions WebSocket', isTransactionsConnected: false });
    }
  },

  disconnectTransactions: () => {
    const ws = (window as WebSocketWindow).explorerTransactionsWs;
    if (ws) {
      ws.close();
      (window as WebSocketWindow).explorerTransactionsWs = undefined;
      set({ isTransactionsConnected: false });
    }
  },

  // Keep legacy methods for backward compatibility
  connect: () => {
    get().connectBlocks();
    get().connectTransactions();
  },

  disconnect: () => {
    get().disconnectBlocks();
    get().disconnectTransactions();
  },

  addBlock: (block: Block) => {
    set((state) => {
      // Check if block already exists
      const exists = state.blocks.some(b => b.height === block.height);
      if (exists) return state;

      return {
        blocks: [block, ...state.blocks].slice(0, 500) // Keep last 500 blocks
      };
    });
  },

  addTransaction: (transaction: Transaction) => {
    set((state) => {
      // Check if transaction already exists
      const exists = state.transactions.some(t => t.hash === transaction.hash);
      if (exists) return state;

      return {
        transactions: [transaction, ...state.transactions].slice(0, 500) // Keep last 500 transactions
      };
    });
  },

  setError: (error: string | null) => set({ error })
}));

interface WebSocketState {
  lastBlock: number | null;
}

export function useWebSocket() {
  const [state, setState] = useState<WebSocketState>({
    lastBlock: null
  });

  useEffect(() => {
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');

    ws.onopen = () => {

      // Subscribe to block updates
      ws.send(JSON.stringify({
        method: "subscribe",
        subscription: "blocks"
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'block') {
          setState(prev => ({
            ...prev,
            lastBlock: data.blockNumber
          }));
        }
      } catch (error) {
        // Silent error handling
      }
    };

    ws.onerror = (error) => {
      // Silent error handling
    };

    ws.onclose = () => {

    };

    return () => {
      ws.close();
    };
  }, []);

  return state;
} 