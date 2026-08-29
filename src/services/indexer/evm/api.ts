import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { parseLtData } from "@/services/api/runtime-validation";
import type { EvmBridgeEvent, EvmStats, EvmDailyStat, EvmBlock } from "./types";
import {
  EvmBridgeEventsArraySchema,
  EvmStatsSchema,
  EvmDailyStatsArraySchema,
  EvmBlocksArraySchema,
} from "./schemas";

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

export async function fetchEvmStats(): Promise<EvmStats> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${EVM}/stats`, {}, EVM_GET_OPTIONS);
    return parseLtData(EvmStatsSchema, raw);
  }, "fetching evm stats");
}

export async function fetchEvmDailyStats(limit = 31): Promise<EvmDailyStat[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${EVM}/stats/daily`, toQuery({ limit }), EVM_GET_OPTIONS);
    return parseLtData(EvmDailyStatsArraySchema, raw);
  }, "fetching evm daily stats");
}

export async function fetchEvmBlocks(limit = 20): Promise<EvmBlock[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${EVM}/blocks`, toQuery({ limit }), EVM_GET_OPTIONS);
    return parseLtData(EvmBlocksArraySchema, raw);
  }, "fetching evm blocks");
}
