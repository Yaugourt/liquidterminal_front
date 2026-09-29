import { create } from 'zustand';

import { Block, Transaction, ExplorerStore } from './types';

import { WebSocketClient, HIDDEN_TAB_PAUSE_MS } from '@/lib/websocket-client';

// Blocks and txs keep a 500-item rolling window that the chain refills within
// seconds, so the firehose can pause in a background tab without a visible gap.

const WS_URL = 'wss://rpc.hyperliquid.xyz/ws';
const MAX_ITEMS = 500;

// A frame is an array: the 25 latest blocks (or txs) right after subscribing,
// newest first, then usually one per frame.
const isBlock = (item: unknown): item is Block =>
  typeof item === 'object' && item !== null && 'blockTime' in item;
const isTransaction = (item: unknown): item is Transaction =>
  typeof item === 'object' && item !== null && 'time' in item && 'action' in item;

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
      pauseWhenHidden: HIDDEN_TAB_PAUSE_MS,
      onOpen: () => {
        set({ isBlocksConnected: true, error: null });
        client.send({
          method: "subscribe",
          subscription: { type: "explorerBlock" }
        });
      },
      onMessage: (data) => {
        if (!Array.isArray(data)) return;
        const blocks = data.filter(isBlock);
        if (blocks.length > 0) get().addBlocks(blocks);
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
      pauseWhenHidden: HIDDEN_TAB_PAUSE_MS,
      onOpen: () => {
        set({ isTransactionsConnected: true, error: null });
        client.send({
          method: "subscribe",
          subscription: { type: "explorerTxs" }
        });
      },
      onMessage: (data) => {
        if (!Array.isArray(data)) return;
        const transactions = data.filter(isTransaction);
        if (transactions.length > 0) get().addTransactions(transactions);
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

  addBlocks: (incoming: Block[]) => {
    set((state) => {
      const known = new Set(state.blocks.map((b) => b.height));
      const fresh: Block[] = [];
      for (const block of incoming) {
        if (known.has(block.height)) continue;
        known.add(block.height);
        fresh.push(block);
      }
      if (fresh.length === 0) return state;

      // Newest first; one update for the list and the height.
      const blocks = [...fresh, ...state.blocks]
        .sort((a, b) => b.height - a.height)
        .slice(0, MAX_ITEMS);
      return {
        blocks,
        currentBlockHeight: Math.max(state.currentBlockHeight, blocks[0].height)
      };
    });
  },

  addTransactions: (incoming: Transaction[]) => {
    set((state) => {
      const known = new Set(state.transactions.map((t) => t.hash));
      const fresh: Transaction[] = [];
      for (const transaction of incoming) {
        if (known.has(transaction.hash)) continue;
        known.add(transaction.hash);
        fresh.push(transaction);
      }
      if (fresh.length === 0) return state;

      // Newest first; the sort is stable, so equal times keep frame order.
      return {
        transactions: [...fresh, ...state.transactions]
          .sort((a, b) => b.time - a.time)
          .slice(0, MAX_ITEMS)
      };
    });
  },

  setError: (error: string | null) => set({ error })
}));

