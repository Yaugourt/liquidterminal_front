import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import type {
  EvmStats,
  EvmDailyStatEntry,
  EvmBlock,
  EvmTransaction,
  EvmBridgeEvent,
  EvmLedgerTransfer,
} from "./types";

const EVM = "/indexer/evm";

const EVM_GET_OPTIONS = { retryOnError: false } as const;

function assertLtData<T>(body: unknown): T {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid API response");
  }
  const r = body as { success?: boolean; data?: unknown; error?: string };
  if (r.success === false) {
    throw new Error(typeof r.error === "string" ? r.error : "Request failed");
  }
  if (!("data" in r)) {
    throw new Error("Invalid API response");
  }
  return r.data as T;
}

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
    return assertLtData<EvmStats>(raw);
  }, "fetching evm stats");
}

export async function fetchEvmStatsDaily(days?: number): Promise<EvmDailyStatEntry[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${EVM}/stats/daily`,
      toQuery({ days: days ?? null }),
      EVM_GET_OPTIONS
    );
    return assertLtData<EvmDailyStatEntry[]>(raw);
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
    return assertLtData<EvmBlock[]>(raw);
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
    return assertLtData<EvmTransaction[]>(raw);
  }, "fetching evm transactions");
}

export async function fetchEvmBridgeEvents(params?: {
  limit?: number;
}): Promise<EvmBridgeEvent[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${EVM}/bridge-events`,
      toQuery(params ?? {}),
      EVM_GET_OPTIONS
    );
    return assertLtData<EvmBridgeEvent[]>(raw);
  }, "fetching evm bridge events");
}

export async function fetchEvmLedgerTransfers(params?: {
  limit?: number;
}): Promise<EvmLedgerTransfer[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${EVM}/ledger-transfers`,
      toQuery(params ?? {}),
      EVM_GET_OPTIONS
    );
    return assertLtData<EvmLedgerTransfer[]>(raw);
  }, "fetching evm ledger transfers");
}
