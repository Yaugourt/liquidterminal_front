export interface EvmStats {
  blocks_indexed: number;
  txs_indexed: number;
  logs_indexed: number;
}

export interface EvmDailyStatEntry {
  date: string;
  blocks_count: number;
  txs_count: number;
}

export interface EvmBlock {
  block_number: number;
  block_time: number;
  tx_count: number;
  gas_used?: string;
  miner?: string;
}

export interface EvmTransaction {
  hash: string;
  block_number: number;
  from_addr: string;
  to_addr: string | null;
  value: string;
  gas_used?: number;
  time_ms?: number;
}

export interface EvmBridgeEvent {
  type: "deposit" | "withdrawal";
  address: string;
  amount: string;
  tx_hash: string;
  time_ms: number;
}

export interface EvmLedgerTransfer {
  from: string;
  to: string;
  amount: string;
  tx_hash: string;
  time_ms: number;
}

// Hook result types
export interface UseEvmStatsResult {
  stats: EvmStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseEvmBlocksResult {
  blocks: EvmBlock[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseEvmTransactionsResult {
  transactions: EvmTransaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseEvmBridgeEventsResult {
  events: EvmBridgeEvent[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseEvmLedgerTransfersResult {
  transfers: EvmLedgerTransfer[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
