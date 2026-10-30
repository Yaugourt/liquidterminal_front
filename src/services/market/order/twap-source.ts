import { get, postExternal } from '../../api/axios-config';
import { API_URLS } from '../../api/constants';
import { fetchSpotTokens } from '../spot/api';
import { fetchPerpMarkets } from '../perp/api';
import { isTerminal } from './twap-status';
import type { EnrichedTwapOrder, TwapLiveEntry, TwapLiveView, TwapMarketType } from './types';

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
 * Limits: a running TWAP reports no executed size in the polled list
 * (Hyperliquid itself only records it at the end); finished ones carry the
 * real executed size and notional. The backend's live feed (twap-live.store)
 * fills that gap: it pushes new and ended TWAPs within seconds and the
 * executed amounts of running ones, summed from their fills. The polled list
 * stays the base and the fallback; `enrichTwaps` merges the two.
 */

export interface IndexerTwap {
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

/** "error: Insufficient margin…" → error text; finished/terminated/stopped → ended; waitingForTrigger is not running yet. */
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

/** What the enrichment looks up besides the TWAP itself. */
interface SpotLookup {
  name: string;
  price: number;
}

/**
 * The polled half of the TWAP list: REST rows plus the lookup context that
 * enrichment needs. Loaded once per 12s and shared; `enrichTwaps` turns it
 * into orders, with or without the live feed.
 */
export interface TwapBase {
  /** Every TWAP of both queries, one row per twapId, before the stale-activated filter. */
  rows: IndexerTwap[];
  spotByIndex: Map<number, SpotLookup>;
  perpByName: Map<string, { price: number }>;
  /** allMids of the main dex and the HIP-3 dexes of `rows`. */
  mids: Map<string, number>;
  /** Local time of the load. */
  fetchedAt: number;
}

async function loadBase(): Promise<TwapBase> {
  // Everything started in the last 24h, plus whatever is still running from before.
  const [{ recent, running }, spot, perps] = await Promise.all([
    source(),
    fetchSpotTokens({ limit: 1000 }).catch(() => ({ data: [] as { name: string; marketIndex: number; price: number }[] })),
    fetchPerpMarkets({ limit: 1000, sortBy: 'volume', sortOrder: 'desc' }).catch(() => ({ data: [] as { name: string; price: number }[] })),
  ]);
  const byId = new Map<number, IndexerTwap>();
  for (const t of [...recent, ...running]) byId.set(t.twapId, t);
  const rows = [...byId.values()];

  const spotByIndex = new Map<number, SpotLookup>(spot.data.map((s) => [s.marketIndex, { name: s.name, price: s.price }]));
  const perpByName = new Map<string, { price: number }>(perps.data.map((p) => [p.name, { price: p.price }]));
  // Dexes of the rows that are not stale: the stale ones are dropped by enrichTwaps anyway.
  const now = Date.now();
  const dexes = [
    ...new Set(
      rows
        .filter((t) => t.coin.includes(':') && (t.status !== 'activated' || startMs(t) + t.minutes * 60_000 > now))
        .map((t) => t.coin.split(':')[0])
    ),
  ];
  const mids = await midsFor(dexes);
  return { rows, spotByIndex, perpByName, mids, fetchedAt: Date.now() };
}

/** A TWAP once the polled row and the live entry are merged. */
interface MergedTwap {
  twapId: number;
  status: string;
  coin: string;
  user: string;
  side: string;
  sz: number;
  minutes: number;
  reduceOnly: boolean;
  randomize: boolean;
  startMs: number;
  executedSz: number;
  executedNtl: number;
  /** Executed amounts cover the whole TWAP. */
  exact: boolean;
  lastFillAt: number | null;
  lastPx: number | null;
  live: boolean;
}

/** Indexer timestamps are UTC without a zone suffix; 0 when unreadable. */
const utcMs = (iso: string): number => {
  const ms = Date.parse(iso.endsWith('Z') ? iso : `${iso}Z`);
  return Number.isFinite(ms) ? ms : 0;
};

/** A live entry that carries everything a row needs: it can stand alone. */
function isFullEntry(e: TwapLiveEntry): e is TwapLiveEntry & Required<Pick<TwapLiveEntry, 'status' | 'coin' | 'user' | 'side' | 'sz' | 'minutes' | 'startTime'>> {
  return (
    e.status !== undefined &&
    e.coin !== undefined &&
    e.user !== undefined &&
    e.side !== undefined &&
    e.sz !== undefined &&
    e.minutes !== undefined &&
    e.startTime !== undefined
  );
}

/**
 * Merge of the polled list and the live feed, per twapId.
 *
 * (a) Status: a REST 'error: ...' always wins (the status channel never
 *     reports errors). Otherwise a terminal status (finished, terminated,
 *     stopped, canceled, cancelled, error..., see `isTerminal`) beats a
 *     non-terminal one ('activated', 'waitingForTrigger') whatever the source.
 *     Two terminal or two non-terminal statuses: the later update wins (REST
 *     `updatedAt` against the live `statusAt`, a tie goes to REST), so a
 *     'waitingForTrigger' followed by 'activated' moves on.
 * (b) A running TWAP present in REST keeps its static fields from REST; its
 *     executed amounts come from the live entry when there is one (the larger
 *     of the two, both only ever grow).
 * (c) A TWAP only the live feed knows (REST lags 1-4s, plus the 12s memo) is
 *     included when its entry is full and it has fills, or when its status is
 *     terminal: the status channel announces TWAPs that fail at once as
 *     'activated' and never ends them, so only a fill proves one is running
 *     (the backend itself withholds non-terminal entries until their first fill).
 * (d) A progress-only entry applies to the REST row of the same twapId;
 *     without a row it waits in the store until one appears.
 * (e) Not connected, or upstream down: nothing is exact any more, but the
 *     executed amounts already known stay as a floor.
 */
function mergeTwap(rest: IndexerTwap | null, live: TwapLiveEntry | undefined, connected: boolean): MergedTwap | null {
  if (!rest) {
    if (!live || !isFullEntry(live)) return null;
    if (!isTerminal(live.status) && live.fills <= 0) return null;
    return {
      twapId: live.twapId,
      status: live.status,
      coin: live.coin,
      user: live.user,
      side: live.side,
      sz: live.sz,
      minutes: live.minutes,
      reduceOnly: live.reduceOnly ?? false,
      randomize: live.randomize ?? false,
      startMs: live.startTime,
      executedSz: live.executedSz,
      executedNtl: live.executedNtl,
      exact: isTerminal(live.status) || (connected && live.exact),
      lastFillAt: live.lastFillAt,
      lastPx: live.lastPx,
      live: true,
    };
  }

  let status = rest.status;
  if (live?.status !== undefined && !rest.status.startsWith('error')) {
    const liveTerminal = isTerminal(live.status);
    if (liveTerminal !== isTerminal(rest.status)) {
      if (liveTerminal) status = live.status;
    } else if ((live.statusAt ?? 0) > utcMs(rest.updatedAt)) {
      status = live.status;
    }
  }

  let executedSz = rest.executedSz;
  let executedNtl = rest.executedNtl;
  if (live && live.executedSz > executedSz) {
    executedSz = live.executedSz;
    executedNtl = live.executedNtl;
  }
  return {
    twapId: rest.twapId,
    status,
    coin: rest.coin,
    user: rest.user,
    side: rest.side,
    sz: rest.sz,
    minutes: rest.minutes,
    reduceOnly: rest.reduceOnly,
    randomize: rest.randomize,
    startMs: startMs(rest),
    executedSz,
    executedNtl,
    exact: isTerminal(status) || (connected && live?.exact === true),
    lastFillAt: live?.lastFillAt ?? null,
    lastPx: live?.lastPx ?? null,
    live: live !== undefined,
  };
}

/**
 * The orders of the polled base with the live feed merged in (see
 * `mergeTwap` for the rules). Pure: `now` and the feed are arguments, so
 * callers recompute it whenever either moves. Without a feed it is the plain
 * polled list.
 */
export function enrichTwaps(base: TwapBase, live: TwapLiveView | null, now: number): EnrichedTwapOrder[] {
  const entries = live?.entries;
  const connected = live?.connected ?? false;
  const merged: MergedTwap[] = [];
  const seen = new Set<number>();
  for (const row of base.rows) {
    seen.add(row.twapId);
    const m = mergeTwap(row, entries?.get(row.twapId), connected);
    if (m) merged.push(m);
  }
  if (entries) {
    for (const [id, entry] of entries) {
      if (seen.has(id)) continue;
      const m = mergeTwap(null, entry, connected);
      if (m) merged.push(m);
    }
  }

  // The indexer keeps some TWAPs "activated" long after their end (4,877 of
  // 5,344 on 3 Oct 2026, a few dated 1970). Past their end they are not
  // running, whatever the flag says; their final state is unknown, so drop them.
  const { spotByIndex, perpByName, mids } = base;
  return merged
    .filter((t) => t.status !== 'activated' || t.startMs + t.minutes * 60_000 > now)
    .map((t): EnrichedTwapOrder => {
      const market = marketOf(t.coin);
      const spotToken = market === 'spot' && t.coin.startsWith('@') ? spotByIndex.get(Number(t.coin.slice(1))) : undefined;
      let symbol = market === 'hip3' ? t.coin.split(':')[1] : spotToken?.name ?? t.coin;
      if (symbol === 'USDT_USDC') symbol = 'USDT0';
      const avgPx = t.executedSz > 0 ? t.executedNtl / t.executedSz : 0;
      const price = mids.get(t.coin) || spotToken?.price || perpByName.get(t.coin)?.price || t.lastPx || avgPx || 0;
      const durationMs = t.minutes * 60_000;
      const { ended, error } = lifecycle(t.status);
      const doneFraction = t.sz > 0 ? Math.min(1, t.executedSz / t.sz) : 0;
      let progressionPercent = doneFraction * 100;
      if (t.status === 'activated') {
        const timeFraction = Math.min(1, Math.max(0, (now - t.startMs) / durationMs));
        progressionPercent = (t.exact ? doneFraction : Math.max(timeFraction, doneFraction)) * 100;
      }
      return {
        time: t.startMs,
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
        estimatedEndTime: t.startMs + durationMs,
        marketType: market,
        twapId: t.twapId,
        status: t.status,
        executedSz: t.executedSz,
        executedNtl: t.executedNtl,
        executedExact: t.exact,
        lastFillAt: t.lastFillAt,
        live: t.live,
      };
    });
}

let cache: { at: number; data: Promise<TwapBase> } | null = null;

/**
 * The polled base of the TWAP list (last 24h + still running), shared across
 * every hook on the page for 12s, so three widgets cost one load; a poll
 * costs one /indexer/twaps/source request, plus /source/deep once a minute.
 */
export function fetchTwapBase(): Promise<TwapBase> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const data = loadBase();
  cache = { at: Date.now(), data };
  data.catch(() => {
    if (cache?.data === data) cache = null;
  });
  return data;
}

/** All TWAPs worth showing (last 24h + still running), enriched, without the live feed. */
export async function fetchIndexedTwaps(): Promise<EnrichedTwapOrder[]> {
  return enrichTwaps(await fetchTwapBase(), null, Date.now());
}
