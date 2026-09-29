import { create } from 'zustand';

import { Block, Transaction, ExplorerStore } from './types';

import { WebSocketClient, HIDDEN_TAB_PAUSE_MS, PING_HEARTBEAT } from '@/lib/websocket-client';

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

/** Newest-first merge of a batch into the list; null when nothing is new. */
function mergeBlocks(current: Block[], incoming: Block[]): Block[] | null {
  const known = new Set(current.map((b) => b.height));
  const fresh: Block[] = [];
  for (const block of incoming) {
    if (known.has(block.height)) continue;
    known.add(block.height);
    fresh.push(block);
  }
  if (fresh.length === 0) return null;
  return [...fresh, ...current].sort((a, b) => b.height - a.height).slice(0, MAX_ITEMS);
}

/** Same for transactions; the sort is stable, so equal times keep frame order. */
function mergeTransactions(current: Transaction[], incoming: Transaction[]): Transaction[] | null {
  const known = new Set(current.map((t) => t.hash));
  const fresh: Transaction[] = [];
  for (const transaction of incoming) {
    if (known.has(transaction.hash)) continue;
    known.add(transaction.hash);
    fresh.push(transaction);
  }
  if (fresh.length === 0) return null;
  return [...fresh, ...current].sort((a, b) => b.time - a.time).slice(0, MAX_ITEMS);
}

/**
 * Blocks and txs each land ~14 times a second. Frames are buffered and applied
 * every FLUSH_MS in one store update: ~4 renders a second for both lists
 * instead of ~28 (measured 2026-09-29: /explorer main thread 33 % → 14 % at
 * 4x CPU), and the rows still move at a readable pace.
 */
const FLUSH_MS = 250;
let pendingBlocks: Block[] = [];
let pendingTransactions: Transaction[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function queueFrame(blocks: Block[], transactions: Transaction[]): void {
  pendingBlocks.push(...blocks);
  pendingTransactions.push(...transactions);
  if (!flushTimer) flushTimer = setTimeout(flushFrames, FLUSH_MS);
}

function flushFrames(): void {
  flushTimer = null;
  const incomingBlocks = pendingBlocks;
  const incomingTransactions = pendingTransactions;
  pendingBlocks = [];
  pendingTransactions = [];
  useExplorerStore.setState((state) => {
    const blocks = incomingBlocks.length > 0 ? mergeBlocks(state.blocks, incomingBlocks) : null;
    const transactions =
      incomingTransactions.length > 0 ? mergeTransactions(state.transactions, incomingTransactions) : null;
    if (!blocks && !transactions) return state;
    return {
      ...(blocks ? { blocks, currentBlockHeight: Math.max(state.currentBlockHeight, blocks[0].height) } : {}),
      ...(transactions ? { transactions } : {}),
    };
  });
}

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
    // Reuse the client: connect() is a no-op while OPEN/CONNECTING (the old
    // isConnected() guard let a second call orphan a CONNECTING socket).
    const existing = get().blocksClient;
    if (existing) {
      existing.connect();
      return;
    }

    const client = new WebSocketClient({
      url: WS_URL,
      pauseWhenHidden: HIDDEN_TAB_PAUSE_MS,
      heartbeat: PING_HEARTBEAT,
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
        if (blocks.length > 0) queueFrame(blocks, []);
      },
      onClose: () => set({ isBlocksConnected: false }),
      onError: () => set({ error: 'Blocks WebSocket connection error' })
    });

    set({ blocksClient: client });
    client.connect();
  },

  disconnectBlocks: () => {
    pendingBlocks = [];
    const { blocksClient } = get();
    if (blocksClient) {
      blocksClient.disconnect();
      set({ blocksClient: null, isBlocksConnected: false });
    }
  },

  connectTransactions: () => {
    // Reuse the client (see connectBlocks).
    const existing = get().transactionsClient;
    if (existing) {
      existing.connect();
      return;
    }

    const client = new WebSocketClient({
      url: WS_URL,
      pauseWhenHidden: HIDDEN_TAB_PAUSE_MS,
      heartbeat: PING_HEARTBEAT,
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
        if (transactions.length > 0) queueFrame([], transactions);
      },
      onClose: () => set({ isTransactionsConnected: false }),
      onError: () => set({ error: 'Transactions WebSocket connection error' })
    });

    set({ transactionsClient: client });
    client.connect();
  },

  disconnectTransactions: () => {
    pendingTransactions = [];
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
      const blocks = mergeBlocks(state.blocks, incoming);
      if (!blocks) return state;
      return {
        blocks,
        currentBlockHeight: Math.max(state.currentBlockHeight, blocks[0].height)
      };
    });
  },

  addTransactions: (incoming: Transaction[]) => {
    set((state) => {
      const transactions = mergeTransactions(state.transactions, incoming);
      return transactions ? { transactions } : state;
    });
  },

  setError: (error: string | null) => set({ error })
}));

