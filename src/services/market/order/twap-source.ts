import { get, postExternal } from '../../api/axios-config';
import { API_URLS } from '../../api/constants';
import { fetchSpotTokens } from '../spot/api';
import { fetchPerpMarkets } from '../perp/api';
import type { EnrichedTwapOrder, TwapMarketType } from './types';

/**
 * TWAP orders from our indexer (HypeDexer through the backend), the primary
 * source since 3 Oct 2026. Compared with the public Hypurrscan list on the
 * same 24 hours: 2,757 TWAPs against 444, 438 of Hypurrscan's 443 valid ones
 * matched (start time within 0.5s median), and every status disagreement
 * checked against Hyperliquid's twapHistory went the indexer's way
 * (terminated or errored TWAPs Hypurrscan still showed as running). It also
 * returns running TWAPs started more than 24h ago, which the 24h list misses
 * (40 of 40 sampled running ones confirmed running by Hyperliquid).
 *
 * Limits: a running TWAP reports no executed size (Hyperliquid itself only
 * records it at the end), so progress stays an estimate from elapsed time;
 * finished ones carry the real executed size and notional.
 */

interface IndexerTwap {
  twapId: number;
  status: string;
  coin: string;
  user: string;
  side: string;
  sz: number;
  executedSz: number;
  executedNtl: number;
  minutes: number;
  reduceOnly: boolean;
  randomize: boolean;
  startTime: string;
  updatedAt: string;
}

interface Envelope<T> {
  success: boolean;
  data: T;
}

/**
 * Just under the 15s poll of useTwapOrders: the memo dedupes the widgets of
 * one page (and hooks mounted a few seconds apart), and a poll never reads
 * back its own previous list.
 */
const TTL_MS = 12_000;

interface SourcePayload {
  recent: IndexerTwap[];
  running: IndexerTwap[];
  /** Start of the backend's deep walk per query; null when nothing is deeper. */
  deepAt: { recent: number | null; running: number | null };
  updatedAt: number;
}

interface DeepRows {
  at: number;
  rows: IndexerTwap[];
}

interface DeepPayload {
  recent: DeepRows | null;
  running: DeepRows | null;
}

/**
 * The backend serves each query in two parts: the first page and what was
 * seen on it (every poll, ~20 KB compressed), and the deeper rows (~90% of
 * the bytes, renewed once a minute). The deep rows are fetched only when the
 * walk they come from changes, keyed by `deepAt`; if that fetch fails the
 * previous walk's rows are used, and without any the load fails (the
 * /market/twap fallback in api.ts applies).
 */
let deepMemo: { key: string; payload: DeepPayload } | null = null;

async function deepRows(deepAt: SourcePayload['deepAt']): Promise<DeepPayload> {
  if (deepAt.recent === null && deepAt.running === null) return { recent: null, running: null };
  const key = `${deepAt.recent}:${deepAt.running}`;
  if (deepMemo?.key === key) return deepMemo.payload;
  try {
    const res = await get<Envelope<DeepPayload>>('/indexer/twaps/source/deep');
    if (!res.success) throw new Error('indexer twaps unavailable');
    deepMemo = { key, payload: res.data };
  } catch (error) {
    if (!deepMemo) throw error;
  }
  return deepMemo.payload;
}

/** Both queries (TWAPs started in the last 24h, TWAPs still running), deep rows first: the fresher row wins by twapId. */
const source = async (): Promise<{ recent: IndexerTwap[]; running: IndexerTwap[] }> => {
  const res = await get<Envelope<SourcePayload>>('/indexer/twaps/source');
  if (!res.success) throw new Error('indexer twaps unavailable');
  const { deepAt, recent, running } = res.data;
  const deep = await deepRows(deepAt);
  const merge = (name: 'recent' | 'running', rows: IndexerTwap[]): IndexerTwap[] => {
    const byId = new Map<number, IndexerTwap>();
    // A query whose first page is no longer full has nothing deeper, whatever an older walk held.
    for (const t of deepAt[name] === null ? [] : deep[name]?.rows ?? []) byId.set(t.twapId, t);
    for (const t of rows) byId.set(t.twapId, t);
    return [...byId.values()];
  };
  return { recent: merge('recent', recent), running: merge('running', running) };
};

/** Indexer timestamps are UTC without a zone suffix. */
const startMs = (t: IndexerTwap) => Date.parse(t.startTime.endsWith('Z') ? t.startTime : `${t.startTime}Z`);

const marketOf = (coin: string): TwapMarketType => (coin.includes(':') ? 'hip3' : coin.startsWith('@') || coin.includes('/') ? 'spot' : 'perp');

/** "error: Insufficient margin…" → error text; finished/terminated/stopped → ended. */
function lifecycle(status: string): { ended: string | null; error: string | null } {
  if (status.startsWith('error')) return { ended: 'error', error: status.replace(/^error:\s*/, '') };
  if (status === 'activated') return { ended: null, error: null };
  if (status === 'finished') return { ended: 'finished', error: null };
  if (status === 'waitingForTrigger') return { ended: 'waitingForTrigger', error: null };
  return { ended: 'canceled', error: null };
}

async function midsFor(dexes: string[]): Promise<Map<string, number>> {
  const mids = new Map<string, number>();
  const sets = await Promise.all(
    ['', ...dexes].map((dex) =>
      postExternal<Record<string, string>>(`${API_URLS.HYPERLIQUID_UI_API}/info`, dex ? { type: 'allMids', dex } : { type: 'allMids' }).catch(
        () => ({}) as Record<string, string>
      )
    )
  );
  for (const set of sets) for (const [k, v] of Object.entries(set)) mids.set(k, Number(v));
  return mids;
}

async function load(): Promise<EnrichedTwapOrder[]> {
  // Everything started in the last 24h, plus whatever is still running from before.
  const [{ recent, running }, spot, perps] = await Promise.all([
    source(),
    fetchSpotTokens({ limit: 1000 }).catch(() => ({ data: [] as { name: string; marketIndex: number; price: number }[] })),
    fetchPerpMarkets({ limit: 1000, sortBy: 'volume', sortOrder: 'desc' }).catch(() => ({ data: [] as { name: string; price: number }[] })),
  ]);
  const byId = new Map<number, IndexerTwap>();
  for (const t of [...recent, ...running]) byId.set(t.twapId, t);
  // The indexer keeps some TWAPs "activated" long after their end (4,877 of
  // 5,344 on 3 Oct 2026, a few dated 1970). Past their end they are not
  // running, whatever the flag says; their final state is unknown, so drop them.
  const now = Date.now();
  const rows = [...byId.values()].filter(
    (t) => t.status !== 'activated' || startMs(t) + t.minutes * 60_000 > now
  );

  const spotByIndex = new Map(spot.data.map((s) => [s.marketIndex, s]));
  const perpByName = new Map(perps.data.map((p) => [p.name, p]));
  const dexes = [...new Set(rows.filter((t) => t.coin.includes(':')).map((t) => t.coin.split(':')[0]))];
  const mids = await midsFor(dexes);

  return rows.map((t): EnrichedTwapOrder => {
    const market = marketOf(t.coin);
    const spotToken = market === 'spot' && t.coin.startsWith('@') ? spotByIndex.get(Number(t.coin.slice(1))) : undefined;
    let symbol = market === 'hip3' ? t.coin.split(':')[1] : spotToken?.name ?? t.coin;
    if (symbol === 'USDT_USDC') symbol = 'USDT0';
    const avgPx = t.executedSz > 0 ? t.executedNtl / t.executedSz : 0;
    const price = mids.get(t.coin) || spotToken?.price || perpByName.get(t.coin)?.price || avgPx || 0;
    const time = startMs(t);
    const durationMs = t.minutes * 60_000;
    const { ended, error } = lifecycle(t.status);
    const progressionPercent =
      t.status === 'activated'
        ? Math.min(100, Math.max(0, ((now - time) / durationMs) * 100))
        : t.sz > 0
          ? Math.min(100, (t.executedSz / t.sz) * 100)
          : 0;
    return {
      time,
      user: t.user,
      action: { type: 'twapOrder', twap: { a: -1, b: t.side === 'B', s: String(t.sz), r: t.reduceOnly, m: t.minutes, t: t.randomize } },
      block: 0,
      hash: `twap-${t.twapId}`,
      error,
      ended,
      tokenSymbol: symbol,
      tokenPrice: price,
      totalValueUSD: t.sz * price,
      progressionPercent,
      estimatedEndTime: time + durationMs,
      marketType: market,
      twapId: t.twapId,
      status: t.status,
      executedSz: t.executedSz,
      executedNtl: t.executedNtl,
    };
  });
}

let cache: { at: number; data: Promise<EnrichedTwapOrder[]> } | null = null;

/**
 * All TWAPs worth showing (last 24h + still running), enriched. Shared across
 * every hook on the page for 12s, so three widgets cost one load; a poll
 * costs one /indexer/twaps/source request, plus /source/deep once a minute.
 */
export function fetchIndexedTwaps(): Promise<EnrichedTwapOrder[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const data = load();
  cache = { at: Date.now(), data };
  data.catch(() => {
    if (cache?.data === data) cache = null;
  });
  return data;
}
