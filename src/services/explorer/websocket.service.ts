import { create } from 'zustand';

import { Block, Transaction, ExplorerStore } from './types';

import { WebSocketClient } from '../core/WebSocketClient';

const WS_URL = 'wss://rpc.hyperliquid.xyz/ws';



export const useExplorerStore = create<ExplorerStore>((set, get) => ({
  blocks: [],
  transactions: [],
  isBlocksConnected: false,
  isTransactionsConnected: false,
  error: null,
  currentBlockHeight: 0, // Ajout du compteur simple

  blocksClient: null as WebSocketClient | null,
  transactionsClient: null as WebSocketClient | null,

  connectBlocks: () => {
    // Avoid double connections
    if (get().blocksClient?.isConnected()) return;

    const client = new WebSocketClient({
      url: WS_URL,
      onOpen: () => {
        set({ isBlocksConnected: true, error: null });
        client.send({
          method: "subscribe",
          subscription: { type: "explorerBlock" }
        });
      },
      onMessage: (data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const item = data[0];

        if ('blockTime' in item) {
          get().addBlock(item);
          set((state) => ({
            currentBlockHeight: Math.max(state.currentBlockHeight, item.height)
          }));
        }
      },
      onClose: () => set({ isBlocksConnected: false }),
      onError: () => set({ error: 'Blocks WebSocket connection error' })
    });

    set({ blocksClient: client });
    client.connect();
  },

  disconnectBlocks: () => {
    const { blocksClient } = get();
    if (blocksClient) {
      blocksClient.disconnect();
      set({ blocksClient: null, isBlocksConnected: false });
    }
  },

  connectTransactions: () => {
    // Avoid double connections
    if (get().transactionsClient?.isConnected()) return;

    const client = new WebSocketClient({
      url: WS_URL,
      onOpen: () => {
        set({ isTransactionsConnected: true, error: null });
        client.send({
          method: "subscribe",
          subscription: { type: "explorerTxs" }
        });
      },
      onMessage: (data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const item = data[0];

        if ('time' in item && 'action' in item) {
          get().addTransaction(item);
        }
      },
      onClose: () => set({ isTransactionsConnected: false }),
      onError: () => set({ error: 'Transactions WebSocket connection error' })
    });

    set({ transactionsClient: client });
    client.connect();
  },

  disconnectTransactions: () => {
    const { transactionsClient } = get();
    if (transactionsClient) {
      transactionsClient.disconnect();
      set({ transactionsClient: null, isTransactionsConnected: false });
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

