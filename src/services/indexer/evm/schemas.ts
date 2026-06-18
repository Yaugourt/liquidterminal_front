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
