import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { parseLtData } from "@/services/api/runtime-validation";
import type {
  BuilderDetailStatsPayload,
  BuilderListRow,
  BuildersGlobalStatsPayload,
  BuildersAllTimeframesPayload,
  BuildersTimeframe,
  BuildersTopPayload,
  BuilderUsersPayload,
} from "./types";
import {
  BuilderDetailStatsPayloadSchema,
  BuilderListRowsArraySchema,
  BuildersAllTimeframesPayloadSchema,
  BuildersGlobalStatsPayloadSchema,
  BuildersTopPayloadSchema,
  BuilderUsersPayloadSchema,
} from "./schemas";

const BUILDERS = "/indexer/builders";

/** Avoid axios retry × hook retry storms on 5xx; LT backend still applies its own limits. */
const INDEXER_GET_OPTIONS = { retryOnError: false } as const;
/** Per-builder routes proxy slow HypeDexer leaf endpoints (backend may wait up to ~120s). */
const BUILDER_DETAIL_GET_OPTIONS = { retryOnError: false, timeoutMs: 130_000 } as const;

function toQuery(params: Record<string, string | number | undefined | null>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

export async function fetchBuildersList(): Promise<BuilderListRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${BUILDERS}/list`, undefined, INDEXER_GET_OPTIONS);
    return parseLtData(BuilderListRowsArraySchema, raw);
  }, "fetching indexer builders list");
}

export async function fetchBuildersGlobalStats(
  timeframe?: BuildersTimeframe
): Promise<BuildersGlobalStatsPayload> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${BUILDERS}/stats`, toQuery({ timeframe }), INDEXER_GET_OPTIONS);
    return parseLtData(BuildersGlobalStatsPayloadSchema, raw);
  }, "fetching indexer builders global stats");
}

export async function fetchBuildersStatsAllTimeframes(): Promise<BuildersAllTimeframesPayload> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${BUILDERS}/stats/all-timeframes`, undefined, INDEXER_GET_OPTIONS);
    return parseLtData(BuildersAllTimeframesPayloadSchema, raw);
  }, "fetching indexer builders stats all timeframes");
}

export async function fetchBuildersTop(params?: {
  timeframe?: BuildersTimeframe;
  sort?: string;
  limit?: number;
}): Promise<BuildersTopPayload> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${BUILDERS}/top`, toQuery(params ?? {}), INDEXER_GET_OPTIONS);
    return parseLtData(BuildersTopPayloadSchema, raw);
  }, "fetching indexer builders top");
}

export async function fetchBuilderStats(
  address: string,
  params?: { timeframe?: BuildersTimeframe }
): Promise<BuilderDetailStatsPayload> {
  return withErrorHandling(async () => {
    const enc = encodeURIComponent(address);
    const raw = await get<unknown>(`${BUILDERS}/${enc}/stats`, toQuery(params ?? {}), BUILDER_DETAIL_GET_OPTIONS);
    return parseLtData(BuilderDetailStatsPayloadSchema, raw);
  }, "fetching indexer builder stats");
}

export async function fetchBuilderUsers(
  address: string,
  params?: { timeframe?: BuildersTimeframe; limit?: number }
): Promise<BuilderUsersPayload> {
  return withErrorHandling(async () => {
    const enc = encodeURIComponent(address);
    const raw = await get<unknown>(`${BUILDERS}/${enc}/users`, toQuery(params ?? {}), BUILDER_DETAIL_GET_OPTIONS);
    return parseLtData(BuilderUsersPayloadSchema, raw);
  }, "fetching indexer builder users");
}
