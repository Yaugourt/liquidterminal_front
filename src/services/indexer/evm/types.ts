export interface EvmStats {
  total_blocks: number;
  total_transactions: number;
  total_logs: number;
  first_block?: number;
  last_block?: number;
  first_block_time?: string;
  last_block_time?: string;
}

export interface EvmDailyStatEntry {
  date: string;
  blocks_count: number;
  txs_count: number;
}

export interface EvmBlock {
  block_number: number;
  block_time: string;
  tx_count: number;
  block_hash?: string;
  parent_hash?: string;
  gas_limit?: string;
  gas_used?: string;
  base_fee_per_gas?: string;
  system_tx_count?: number;
}

export interface EvmTransaction {
  tx_hash: string;
  block_number: number;
  from_addr: string;
  to_addr: string | null;
  value_wei: string;
  block_time?: string;
  gas_used?: number;
  tx_type?: number;
  tx_index?: number;
  is_system_tx?: boolean;
}

export interface EvmBridgeEvent {
  event_type: string;
  user_addr: string;
  amount: number;
  time: string;
  block_height?: number;
  validator?: string;
  destination?: string;
  nonce?: number;
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
