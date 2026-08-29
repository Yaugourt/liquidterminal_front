import { z } from "zod";

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

export const EvmBridgeEventsArraySchema = z.array(EvmBridgeEventSchema);

export const EvmStatsSchema = z.object({
  total_blocks: z.number(),
  total_transactions: z.number(),
  total_logs: z.number(),
  first_block: z.number(),
  last_block: z.number(),
  first_block_time: z.string(),
  last_block_time: z.string(),
});

const EvmDailyStatSchema = z.object({
  day: z.string(),
  blocks: z.number(),
  transactions: z.number(),
  system_txs: z.number(),
  gas_used: z.number(),
});
export const EvmDailyStatsArraySchema = z.array(EvmDailyStatSchema);

const EvmBlockSchema = z.object({
  block_time: z.string(),
  block_number: z.number(),
  block_hash: z.string(),
  parent_hash: z.string().optional(),
  gas_limit: z.number().optional(),
  gas_used: z.number().optional(),
  base_fee_per_gas: z.number().optional(),
  tx_count: z.number(),
  system_tx_count: z.number().optional(),
});
export const EvmBlocksArraySchema = z.array(EvmBlockSchema);
