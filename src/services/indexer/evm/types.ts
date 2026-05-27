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

/**
 * Bridge events emitted by Hyperliquid's USDC bridge with Arbitrum.
 *
 * The bridge handles USDC exclusively — no token/asset field exists on the
 * payload. Every user-facing transfer surfaces as multiple events because
 * each validator vote is logged separately (dedupe by `nonce` if you only
 * want unique transfers).
 *
 * Event-type lifecycle:
 *  - `deposit_vote`         — validator votes for an Arbitrum→HL USDC deposit
 *  - `withdraw3`            — user-initiated HL→Arbitrum withdrawal
 *  - `withdrawal_sign`      — validator signs the pending withdrawal
 *  - `withdrawal_finalized` — withdrawal confirmed on Arbitrum
 */
export type EvmBridgeEventType =
  | "deposit_vote"
  | "withdraw3"
  | "withdrawal_sign"
  | "withdrawal_finalized"
  | (string & {});

export interface EvmBridgeEvent {
  event_type: EvmBridgeEventType;
  user_addr: string;
  /** Amount in USDC, already parsed (e.g. `4048.84`). */
  amount: number;
  time: string;
  block_height?: number;
  validator?: string;
  destination?: string;
  nonce?: number;
  /** Raw HL action payload, JSON-encoded. Debug-only. */
  raw?: string;
}

/** True for events that move USDC INTO Hyperliquid (deposits). */
export function isDepositEvent(e: Pick<EvmBridgeEvent, "event_type">): boolean {
  return e.event_type.startsWith("deposit");
}

/** True for events that move USDC OUT of Hyperliquid (withdrawals, any stage). */
export function isWithdrawalEvent(e: Pick<EvmBridgeEvent, "event_type">): boolean {
  return e.event_type.startsWith("withdraw");
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
