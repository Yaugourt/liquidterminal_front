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
type EvmBridgeEventType =
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

/** Lifetime HyperEVM chain stats. */
export interface EvmStats {
  total_blocks: number;
  total_transactions: number;
  total_logs: number;
  first_block: number;
  last_block: number;
  first_block_time: string;
  last_block_time: string;
}

/** One day of HyperEVM activity. */
export interface EvmDailyStat {
  day: string;
  blocks: number;
  transactions: number;
  system_txs: number;
  gas_used: number;
}

/** A HyperEVM block header. */
export interface EvmBlock {
  block_time: string;
  block_number: number;
  block_hash: string;
  parent_hash?: string;
  gas_limit?: number;
  gas_used?: number;
  base_fee_per_gas?: number;
  tx_count: number;
  system_tx_count?: number;
}

// Hook result types
export interface UseEvmBridgeEventsResult {
  events: EvmBridgeEvent[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseEvmStatsResult {
  stats: EvmStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseEvmDailyStatsResult {
  daily: EvmDailyStat[];
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
