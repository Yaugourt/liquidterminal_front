import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { parseLtData } from "@/services/api/runtime-validation";
import type { EvmBridgeEvent } from "./types";
import { EvmBridgeEventsArraySchema } from "./schemas";

const EVM = "/indexer/evm";

const EVM_GET_OPTIONS = { retryOnError: false } as const;

function toQuery(
  params: Record<string, string | number | undefined | null>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

export async function fetchEvmBridgeEvents(params?: {
  limit?: number;
  /** Unix seconds (NOT ms). HypeDexer's `/indexer/evm/bridge/events`
   *  upstream requires both `start_time` AND `end_time` to return anything
   *  beyond the current few minutes — without them it answers `[]`. */
  start_time?: number;
  end_time?: number;
}): Promise<EvmBridgeEvent[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${EVM}/bridge/events`,
      toQuery(params ?? {}),
      EVM_GET_OPTIONS
    );
    return parseLtData(EvmBridgeEventsArraySchema, raw);
  }, "fetching evm bridge events");
}
