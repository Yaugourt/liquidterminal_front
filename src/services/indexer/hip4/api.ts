import { get, postExternal } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { API_URLS } from "@/services/api/constants";
import type {
  Hip4MarketEnrichedRow,
  Hip4QuestionWithOutcomesRow,
  Hip4FillRow,
  Hip4SettlementRow,
  Hip4AnalyticsBucket,
  Hip4MarketsEnrichedQuery,
  Hip4QuestionsWithOutcomesQuery,
  Hip4FillsQuery,
  Hip4SettlementsQuery,
  Hip4AnalyticsQuery,
  Hip4OutcomeMetaEntry,
  Hip4OutcomeMetaResponse,
  Hip4L2Book,
  Hip4Candle,
  Hip4CandleInterval,
  Hip4OutcomeVolumes,
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

/** Flat enriched markets — parsed side_specs, token_name, question_name, display_name. */
export async function fetchHip4MarketsEnriched(
  params?: Hip4MarketsEnrichedQuery
): Promise<Hip4MarketEnrichedRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/markets-enriched`, toQuery(params ?? {}));
    return assertLtData<Hip4MarketEnrichedRow[]>(raw);
  }, "fetching HIP-4 markets-enriched");
}

/** Questions with nested outcomes (singleton markets surfaced as 1-outcome questions). */
export async function fetchHip4QuestionsWithOutcomes(
  params?: Hip4QuestionsWithOutcomesQuery
): Promise<Hip4QuestionWithOutcomesRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/questions-with-outcomes`, toQuery(params ?? {}));
    return assertLtData<Hip4QuestionWithOutcomesRow[]>(raw);
  }, "fetching HIP-4 questions-with-outcomes");
}

/** Prediction market fills feed. */
export async function fetchHip4Fills(params?: Hip4FillsQuery): Promise<Hip4FillRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/fills`, toQuery(params ?? {}));
    return assertLtData<Hip4FillRow[]>(raw);
  }, "fetching HIP-4 fills");
}

/** Market resolutions with resolved winner_name. */
export async function fetchHip4Settlements(
  params?: Hip4SettlementsQuery
): Promise<Hip4SettlementRow[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/settlements`, toQuery(params ?? {}));
    return assertLtData<Hip4SettlementRow[]>(raw);
  }, "fetching HIP-4 settlements");
}

/** Canonical list of currently-registered outcomes, straight from Hyperliquid
 * (`POST /info { type: "outcomeMeta" }`). This is the source of truth for the
 * live markets HypeDexer's aggregation tables omit. */
export async function fetchHip4OutcomeMeta(): Promise<Hip4OutcomeMetaEntry[]> {
  return withErrorHandling(async () => {
    const res = await postExternal<Hip4OutcomeMetaResponse>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "outcomeMeta" },
      // Fast-fail: one 5s attempt. useDataFetching's 15s poll + maxRetries is the
      // only recovery layer — don't stack the inner 4×10s axios retry chain.
      { timeoutMs: 5000, retryOnError: false }
    );
    return Array.isArray(res?.outcomes) ? res.outcomes : [];
  }, "fetching HIP-4 outcomeMeta");
}

/** Live mid prices for outcome spot coins (`POST /info { type: "allMids" }`),
 * filtered to the `#`-prefixed outcome coins. Value is the implied probability
 * (YES + NO mids sum to 1.0). Only currently-tradeable coins are present. */
export async function fetchHip4AllMids(): Promise<Record<string, string>> {
  return withErrorHandling(async () => {
    const all = await postExternal<Record<string, string>>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "allMids" },
      { timeoutMs: 5000, retryOnError: false }
    );
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(all ?? {})) {
      if (k.startsWith("#")) out[k] = v;
    }
    return out;
  }, "fetching HIP-4 allMids");
}

/** The LT backend validates `coin` as a string of at most 256 chars. */
const ANALYTICS_COIN_PARAM_MAX = 256;
/** Backend max for `limit`, which caps the rows of a request across all its coins. */
const ANALYTICS_ROW_LIMIT = 2000;

/** Packs coin ids into comma-joined `coin` params that each fit the backend cap. */
function chunkCoinParam(coinIds: number[]): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const id of coinIds) {
    const next = current ? `${current},${id}` : String(id);
    if (current && next.length > ANALYTICS_COIN_PARAM_MAX) {
      chunks.push(current);
      current = String(id);
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Cumulative notional volume per outcome coin, summed from the indexer's 1d
 * analytics buckets. HypeDexer ingests fills for the live coins even though it
 * omits them from markets-enriched, so this recovers their volume. The coin
 * list (~450 coins) is split into ≤256-char batches fetched in parallel.
 * `partial` is set when a batch failed or hit the row limit; throws only when
 * every batch failed (the indexer `/analytics` can 402). */
export async function fetchHip4OutcomeVolumes(
  coinIds: number[]
): Promise<Hip4OutcomeVolumes> {
  if (coinIds.length === 0) return { volumes: {}, partial: false };
  const results = await Promise.allSettled(
    chunkCoinParam(coinIds).map((coin) =>
      withErrorHandling(async () => {
        const raw = await get<unknown>(`${HIP4}/analytics`, {
          coin,
          interval: "1d",
          limit: ANALYTICS_ROW_LIMIT,
        });
        return assertLtData<Hip4AnalyticsBucket[]>(raw);
      }, "fetching HIP-4 outcome volumes")
    )
  );

  const firstFailure = results.find(
    (r): r is PromiseRejectedResult => r.status === "rejected"
  );
  if (firstFailure && results.every((r) => r.status === "rejected")) {
    throw firstFailure.reason;
  }

  const volumes: Record<number, number> = {};
  let partial = firstFailure !== undefined;
  for (const r of results) {
    if (r.status === "rejected") continue;
    // A full page means the oldest buckets were cut off: sums are understated.
    if (r.value.length >= ANALYTICS_ROW_LIMIT) partial = true;
    for (const b of r.value) {
      if (!b.coin) continue;
      const id = parseInt(b.coin.replace(/^#/, ""), 10);
      if (Number.isNaN(id)) continue;
      volumes[id] = (volumes[id] ?? 0) + (b.volume ?? 0);
    }
  }
  return { volumes, partial };
}

/** Live L2 order book for an outcome coin (`POST /info { type:"l2Book" }`).
 * Returns `null` for expired/untradeable coins (Hyperliquid returns no book),
 * so callers degrade to a placeholder. `#NNN` coins aren't on the shared market
 * WS, hence this dedicated REST fetch instead of the streamed OrderBook. */
export async function fetchHip4OrderBook(coin: string): Promise<Hip4L2Book | null> {
  return withErrorHandling(async () => {
    const res = await postExternal<Hip4L2Book | null>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "l2Book", coin },
      { timeoutMs: 5000, retryOnError: false }
    );
    if (!res || !Array.isArray(res.levels) || res.levels.length < 2) return null;
    return res;
  }, "fetching HIP-4 order book");
}

/** OHLC candles for an outcome coin (`POST /info { type:"candleSnapshot" }`).
 * o/c/h/l are the implied probability (0–1). Returns `[]` for expired coins
 * (no candle feed), so the chart falls back to the fills-reconstructed series. */
export async function fetchHip4OutcomeCandles(
  coin: string,
  interval: Hip4CandleInterval,
  startTime: number,
  endTime?: number
): Promise<Hip4Candle[]> {
  return withErrorHandling(async () => {
    const res = await postExternal<Hip4Candle[]>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: "candleSnapshot", req: { coin, interval, startTime, endTime } },
      { timeoutMs: 5000, retryOnError: false }
    );
    return Array.isArray(res) ? res : [];
  }, "fetching HIP-4 outcome candles");
}

/** Time-bucketed analytics — volume, fills, fees, unique traders.
 * LT backend unwraps HypeDexer's `{ status, count, data: [...] }` envelope
 * server-side, so `data` is already a flat bucket array. */
export async function fetchHip4Analytics(
  params?: Hip4AnalyticsQuery
): Promise<Hip4AnalyticsBucket[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(`${HIP4}/analytics`, toQuery(params ?? {}));
    return assertLtData<Hip4AnalyticsBucket[]>(raw);
  }, "fetching HIP-4 analytics");
}
