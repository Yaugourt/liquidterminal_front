import { create } from 'zustand';

interface Block {
  height: number;
  blockTime: number;
  hash: string;
  numTxs: number;
  proposer: string;
}

interface Transaction {
  time: number;
  user: string;
  hash: string;
  block: number;
  error: string | null;
  action: {
    type: string;
    cancels?: Array<{
      a: number;
      o: number;
    }>;
    // Add other action types as needed
  };
}

interface ExplorerState {
  blocks: Block[];
  transactions: Transaction[];
  isConnected: boolean;
  error: string | null;
}

interface ExplorerStore extends ExplorerState {
  connect: () => void;
  disconnect: () => void;
  addBlock: (block: Block) => void;
  addTransaction: (transaction: Transaction) => void;
  setError: (error: string | null) => void;
}

const WS_URL = 'wss://rpc.hyperliquid.xyz/ws';

export const useExplorerStore = create<ExplorerStore>((set, get) => ({
  blocks: [],
  transactions: [],
  isConnected: false,
  error: null,

  connect: () => {
    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        set({ isConnected: true, error: null });
        
        // Subscribe to block updates
        ws.send(JSON.stringify({
          method: "subscribe",
          subscription: { type: "explorerBlock" }
        }));

        // Subscribe to transaction updates
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
          
          // Determine if it's a block or transaction based on the data structure
          if ('blockTime' in item) {
            get().addBlock(item);
          } else if ('time' in item && 'action' in item) {
            get().addTransaction(item);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          set({ error: 'Failed to parse data' });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({ error: 'WebSocket connection error', isConnected: false });
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        set({ isConnected: false });
      };

      // Store WebSocket instance
      (window as any).explorerWs = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      set({ error: 'Failed to connect to WebSocket', isConnected: false });
    }
  },

  disconnect: () => {
    const ws = (window as any).explorerWs;
    if (ws) {
      ws.close();
      set({ isConnected: false });
    }
  },

  addBlock: (block: Block) => {
    set((state) => {
      // Check if block already exists
      const exists = state.blocks.some(b => b.height === block.height);
      if (exists) return state;

      return {
        blocks: [block, ...state.blocks].slice(0, 100) // Keep last 100 blocks
      };
    });
  },

  addTransaction: (transaction: Transaction) => {
    set((state) => {
      // Check if transaction already exists
      const exists = state.transactions.some(t => t.hash === transaction.hash);
      if (exists) return state;

      return {
        transactions: [transaction, ...state.transactions].slice(0, 100) // Keep last 100 transactions
      };
    });
  },

  setError: (error: string | null) => set({ error })
})); 