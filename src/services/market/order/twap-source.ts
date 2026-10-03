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

const PAGE = 500;
const MAX_PAGES = 12;
const TTL_MS = 30_000;

async function pages(params: Record<string, unknown>): Promise<IndexerTwap[]> {
  const out: IndexerTwap[] = [];
  for (let i = 0; i < MAX_PAGES; i++) {
    const res = await get<Envelope<IndexerTwap[]>>('/indexer/twaps', { ...params, limit: PAGE, offset: i * PAGE });
    if (!res.success) throw new Error('indexer twaps unavailable');
    out.push(...res.data);
    if (res.data.length < PAGE) break;
  }
  return out;
}

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
  const [recent, running, spot, perps] = await Promise.all([
    pages({ hours: 24 }),
    // Running TWAPs last at most 7 days (10,080 min): 170h covers them all.
    pages({ status: 'activated', hours: 170 }),
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
 * every hook on the page for 30s, so three widgets cost one load.
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
