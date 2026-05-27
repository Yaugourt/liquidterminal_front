import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { parseLtData } from "@/services/api/runtime-validation";
import type {
  EvmStats,
  EvmDailyStatEntry,
  EvmBlock,
  EvmTransaction,
  EvmBridgeEvent,
  EvmLedgerTransfer,
} from "./types";
import {
  EvmStatsSchema,
  EvmDailyStatsArraySchema,
  EvmBlocksArraySchema,
  EvmTransactionsArraySchema,
  EvmBridgeEventsArraySchema,
  EvmLedgerTransfersArraySchema,
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

export async function fetchEvmStats(): Promise<EvmStats> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${EVM}/stats`, undefined, EVM_GET_OPTIONS);
    return parseLtData(EvmStatsSchema, raw);
  }, "fetching evm stats");
}

export async function fetchEvmStatsDaily(days?: number): Promise<EvmDailyStatEntry[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${EVM}/stats/daily`,
      toQuery({ days: days ?? null }),
      EVM_GET_OPTIONS
    );
    return parseLtData(EvmDailyStatsArraySchema, raw);
  }, "fetching evm stats daily");
}

export async function fetchEvmBlocks(params?: {
  limit?: number;
}): Promise<EvmBlock[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${EVM}/blocks`,
      toQuery(params ?? {}),
      EVM_GET_OPTIONS
    );
    return parseLtData(EvmBlocksArraySchema, raw);
  }, "fetching evm blocks");
}

export async function fetchEvmTransactions(params?: {
  limit?: number;
  block_number?: number;
  to_addr?: string;
}): Promise<EvmTransaction[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${EVM}/transactions`,
      toQuery(params ?? {}),
      EVM_GET_OPTIONS
    );
    return parseLtData(EvmTransactionsArraySchema, raw);
  }, "fetching evm transactions");
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

export async function fetchEvmLedgerTransfers(params?: {
  limit?: number;
}): Promise<EvmLedgerTransfer[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${EVM}/ledger/transfers`,
      toQuery(params ?? {}),
      EVM_GET_OPTIONS
    );
    return parseLtData(EvmLedgerTransfersArraySchema, raw);
  }, "fetching evm ledger transfers");
}
