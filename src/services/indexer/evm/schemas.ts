import { z } from "zod";

export const EvmStatsSchema = z.object({
  total_blocks: z.number(),
  total_transactions: z.number(),
  total_logs: z.number(),
  first_block: z.number().optional(),
  last_block: z.number().optional(),
  first_block_time: z.string().optional(),
  last_block_time: z.string().optional(),
});

const EvmDailyStatEntrySchema = z.object({
  date: z.string(),
  blocks_count: z.number(),
  txs_count: z.number(),
});

const EvmBlockSchema = z.object({
  block_number: z.number(),
  block_time: z.string(),
  tx_count: z.number(),
  block_hash: z.string().optional(),
  parent_hash: z.string().optional(),
  gas_limit: z.string().optional(),
  gas_used: z.string().optional(),
  base_fee_per_gas: z.string().optional(),
  system_tx_count: z.number().optional(),
});

const EvmTransactionSchema = z.object({
  tx_hash: z.string(),
  block_number: z.number(),
  from_addr: z.string(),
  to_addr: z.string().nullable(),
  value_wei: z.string(),
  block_time: z.string().optional(),
  gas_used: z.number().optional(),
  tx_type: z.number().optional(),
  tx_index: z.number().optional(),
  is_system_tx: z.boolean().optional(),
});

const EvmBridgeEventSchema = z.object({
  event_type: z.string(),
  user_addr: z.string(),
  amount: z.number(),
  time: z.string(),
  block_height: z.number().optional(),
  validator: z.string().optional(),
  destination: z.string().optional(),
  nonce: z.number().optional(),
});

const EvmLedgerTransferSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.string(),
  tx_hash: z.string(),
  time_ms: z.number(),
});

export const EvmDailyStatsArraySchema = z.array(EvmDailyStatEntrySchema);
export const EvmBlocksArraySchema = z.array(EvmBlockSchema);
export const EvmTransactionsArraySchema = z.array(EvmTransactionSchema);
export const EvmBridgeEventsArraySchema = z.array(EvmBridgeEventSchema);
export const EvmLedgerTransfersArraySchema = z.array(EvmLedgerTransferSchema);
