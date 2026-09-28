/**
 * Elysium (L2 on HyperEVM, testnet) shapes, as served by the backend proxy
 * `/indexer/elysium/*`. Timestamps are UTC strings without a timezone suffix;
 * parse them with `elysiumTimeMs`. Amounts are token units (no USD anywhere).
 */

export interface ElysiumStats {
  total_blocks: number;
  total_transactions: number;
  user_transactions: number;
  spam_transactions: number;
  bridge_transactions: number;
  total_logs: number;
  unique_senders: number;
  contracts_created: number;
  first_block: number;
  last_block: number;
  first_block_time: string;
  last_block_time: string;
  last_batch_number: number;
  last_batched_block: number;
}

export interface ElysiumDailyStat {
  /** YYYY-MM-DD, newest first; days without blocks are absent. */
  day: string;
  blocks: number;
  transactions: number;
  user_transactions: number;
  spam_transactions: number;
  bridge_transactions: number;
  active_addresses: number;
  contracts_created: number;
  gas_used: number;
}

export interface ElysiumBlock {
  block_time: string;
  block_number: number;
  block_hash: string;
  gas_used: number;
  base_fee_per_gas: number;
  /** HyperEVM block the L2 block was built against. */
  l1_block_number: number;
  tx_count: number;
  user_tx_count: number;
}

export interface ElysiumTransaction {
  block_time: string;
  block_number: number;
  tx_hash: string;
  tx_type: string;
  from_addr: string;
  to_addr: string;
  /** Set when the transaction created a contract. */
  contract_address: string;
  value_wei: string;
  gas_used: number;
  /** 1 = success, 0 = reverted. */
  success: number;
  method_id: string;
  is_system: number;
  is_spam: number;
}

export interface ElysiumBatch {
  batch_number: number;
  /** HyperEVM block and transaction that posted the batch. */
  parent_block: number;
  parent_time: string;
  parent_tx_hash: string;
  first_block: number;
  last_block: number;
  block_count: number;
  last_block_time: string;
  /** Seconds between the batch's last L2 block and its posting on HyperEVM. */
  posting_delay_s: number;
}

export type ElysiumBridgeDirection = "deposit" | "withdrawal";

export interface ElysiumBridgeTransfer {
  transfer_id: string;
  direction: ElysiumBridgeDirection;
  asset: string;
  route: string;
  status: string;
  symbol: string;
  decimals: number;
  from_addr: string;
  to_addr: string;
  /** Decimal-adjusted token amount. */
  amount: number;
  l1_tx_hash: string;
  l2_tx_hash: string;
  initiated_time: string | null;
  completed_time: string | null;
  duration_s: number | null;
}

export type ElysiumReserveRoute = "native" | "canonical" | "mirror";

export interface ElysiumReserve {
  snapshot_time: string;
  route: ElysiumReserveRoute;
  symbol: string;
  decimals: number;
  /** Held in the HyperEVM escrow. */
  locked: number;
  /** Circulating on Elysium. */
  supply: number;
  backed: boolean;
}

export interface ElysiumToken {
  address: string;
  standard: string;
  name: string;
  symbol: string;
  origin: string;
  first_seen: string;
  transfer_count: number;
}

export interface ElysiumBridgedToken {
  l2_token: string;
  route: string;
  symbol: string;
  name: string;
  deposits: number;
  withdrawals: number;
  last_transfer_time: string | null;
}

// ── Computed analytics (our own aggregates over the ingested chain) ──────────

export interface ElysiumDailyFlag {
  /** YYYY-MM-DD (UTC). */
  day: string;
  /** True for the current, still-filling day. */
  partial?: boolean;
}

export interface ElysiumDeploymentsAnalytics {
  daily: (ElysiumDailyFlag & { deployments: number; deployers: number })[];
  topDeployers: { address: string; deployments: number; firstDeploy: string; lastDeploy: string }[];
  trending: { address: string; deployer: string; deployedAt: string; callers24h: number; txs24h: number; symbol?: string | null }[];
}

export type ElysiumContractKind = "precompile" | "token" | "contract";

export interface ElysiumContractRow {
  address: string;
  kind: ElysiumContractKind;
  label: string | null;
  symbol: string | null;
  deployer: string | null;
  deployedAt: string | null;
  txs: number;
  callers: number;
  gasUsed: number;
  txsPrev: number;
  callersPrev: number;
}

export interface ElysiumUsersAnalytics {
  daily: (ElysiumDailyFlag & { active: number; new: number; returning: number })[];
  retention: { cohortDay: string; size: number; d1: number | null; d7: number | null }[];
  concentration24h: { senders: number; txs: number; top1Share: number; top10Share: number };
  topSenders24h: { address: string; txs: number; share: number; distinctTargets: number }[];
}

export interface ElysiumBridgeAnalytics {
  daily: (ElysiumDailyFlag & { deposits: number; withdrawals: number; hypeIn: number; hypeOut: number; netHype: number })[];
  tokens: { symbol: string; route: string; deposits: number; withdrawals: number; amountIn: number; amountOut: number }[];
  finality: { direction: string; completed: number; medianS: number | null; p90S: number | null }[];
  topBridgers: { address: string; transfers: number; hypeIn: number; hypeOut: number }[];
}

export interface ElysiumEconomicsAnalytics {
  daily: (ElysiumDailyFlag & { txs: number; spamTxs: number; failedTxs: number; feesHype: number; avgFeeHype: number })[];
  totals: { feesHype: number; txs: number };
}

export interface ElysiumIngestStatus {
  streams: { stream: string; cursor: string | null; rows: number; backfillDone: boolean; lastError: string | null; lagSeconds: number | null }[];
}
