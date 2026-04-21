import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import type {
  Hip4MarketRow,
  Hip4QuestionRow,
  Hip4FillRow,
  Hip4FeeRow,
  Hip4SettlementRow,
  Hip4OutcomeTokenRow,
  Hip4FeeScaleRow,
  Hip4UserActionRow,
  Hip4FillsQuery,
  Hip4FeesQuery,
  Hip4MarketsQuery,
  Hip4QuestionsQuery,
  Hip4SettlementsQuery,
  Hip4OutcomeTokensQuery,
  Hip4FeeScalesQuery,
  Hip4UserActionsQuery,
} from "./types";

const HIP4 = "/indexer/hip4";

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

function toQuery(params: object): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

/** Prediction market fills. */
export async function fetchHip4Fills(params?: Hip4FillsQuery): Promise<Hip4FillRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/fills`, toQuery(params ?? {}));
    return assertLtData<Hip4FillRow[]>(raw);
  }, "fetching HIP-4 fills");
}

/** Fees aggregated per user, coin and day. */
export async function fetchHip4Fees(params?: Hip4FeesQuery): Promise<Hip4FeeRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/fees`, toQuery(params ?? {}));
    return assertLtData<Hip4FeeRow[]>(raw);
  }, "fetching HIP-4 fees");
}

/** Outcome markets with question and volume stats. */
export async function fetchHip4Markets(params?: Hip4MarketsQuery): Promise<Hip4MarketRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/markets`, toQuery(params ?? {}));
    return assertLtData<Hip4MarketRow[]>(raw);
  }, "fetching HIP-4 markets");
}

/** Questions grouping related outcomes. */
export async function fetchHip4Questions(params?: Hip4QuestionsQuery): Promise<Hip4QuestionRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/questions`, toQuery(params ?? {}));
    return assertLtData<Hip4QuestionRow[]>(raw);
  }, "fetching HIP-4 questions");
}

/** Market resolutions. */
export async function fetchHip4Settlements(params?: Hip4SettlementsQuery): Promise<Hip4SettlementRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/settlements`, toQuery(params ?? {}));
    return assertLtData<Hip4SettlementRow[]>(raw);
  }, "fetching HIP-4 settlements");
}

/** Outcome token metadata. */
export async function fetchHip4OutcomeTokens(params?: Hip4OutcomeTokensQuery): Promise<Hip4OutcomeTokenRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/outcome-tokens`, toQuery(params ?? {}));
    return assertLtData<Hip4OutcomeTokenRow[]>(raw);
  }, "fetching HIP-4 outcome tokens");
}

/** Fee scale governance events. */
export async function fetchHip4FeeScales(params?: Hip4FeeScalesQuery): Promise<Hip4FeeScaleRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/fee-scales`, toQuery(params ?? {}));
    return assertLtData<Hip4FeeScaleRow[]>(raw);
  }, "fetching HIP-4 fee scales");
}

/** User outcome actions (split, merge, negate). */
export async function fetchHip4UserActions(params?: Hip4UserActionsQuery): Promise<Hip4UserActionRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/user-actions`, toQuery(params ?? {}));
    return assertLtData<Hip4UserActionRow[]>(raw);
  }, "fetching HIP-4 user actions");
}
