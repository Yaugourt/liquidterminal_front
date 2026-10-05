import { z } from "zod/mini";

const EvmBridgeEventSchema = z.object({
  event_type: z.string(),
  user_addr: z.string(),
  amount: z.number(),
  time: z.string(),
  block_height: z.optional(z.number()),
  validator: z.optional(z.string()),
  destination: z.optional(z.string()),
  nonce: z.optional(z.number()),
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
  parent_hash: z.optional(z.string()),
  gas_limit: z.optional(z.number()),
  gas_used: z.optional(z.number()),
  base_fee_per_gas: z.optional(z.number()),
  tx_count: z.number(),
  system_tx_count: z.optional(z.number()),
});
export const EvmBlocksArraySchema = z.array(EvmBlockSchema);
