import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import type { LivePrint } from "./useLiveMarketFeed";

interface Envelope<T> {
  success: boolean;
  data: T;
}

/** One side of a trade as the indexer stores it (each trade yields two fills). */
interface IndexerFill {
  user: string;
  coin: string;
  px: number;
  sz: number;
  side: "B" | "A";
  /** UTC without a timezone suffix, e.g. "2026-09-23T07:35:44.913000". */
  time: string;
  hash: string;
  tid: number;
  fee: number;
}

const ZERO_HASH = /^0x0+$/;

function utcMs(time: string): number {
  return Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(time) ? time : `${time}Z`);
}

/**
 * Folds the two fills of each trade into one print with its aggressor side.
 * Fills carry no taker flag, so the taker is the side that paid the higher fee
 * rate (takers pay more than makers). Checked against the public trades feed:
 * 229 of 235 trades matched; trades whose two rates tie are skipped rather
 * than guessed, and so are trades with only one fill in the window.
 */
function foldFills(fills: IndexerFill[]): LivePrint[] {
  const byTid = new Map<number, IndexerFill[]>();
  for (const f of fills) {
    const list = byTid.get(f.tid);
    if (list) list.push(f);
    else byTid.set(f.tid, [f]);
  }
  const prints: LivePrint[] = [];
  for (const [tid, pair] of byTid) {
    if (pair.length !== 2) continue;
    const [a, b] = pair;
    const rateA = a.fee / (a.px * a.sz);
    const rateB = b.fee / (b.px * b.sz);
    if (!Number.isFinite(rateA) || !Number.isFinite(rateB) || Math.abs(rateA - rateB) < 1e-9) continue;
    const taker = rateA > rateB ? a : b;
    prints.push({
      tid,
      coin: taker.coin,
      side: taker.side,
      px: taker.px,
      sz: taker.sz,
      ntl: taker.px * taker.sz,
      time: utcMs(taker.time),
      taker: taker.user,
      hash: ZERO_HASH.test(taker.hash) ? undefined : taker.hash,
    });
  }
  return prints;
}

/** Coins fetched per wave, and the pause between waves (see fetchRecentPrints). */
const WAVE_SIZE = 4;
const WAVE_GAP_MS = 1_100;

/**
 * Prints at or above `floorUsd` on each coin since `sinceMs`, from the indexed
 * fills: the snapshot the live tape starts from before the websocket takes
 * over. One request per coin so a busy coin cannot crowd the others out of the
 * row limit, sent in waves because the backend caps indexer calls per second
 * per IP and the rest of the page is loading at the same time. `coins` is
 * expected most traded first, so the biggest markets land first. A failing
 * coin is dropped, never fatal: the stream still fills in.
 */
export const fetchRecentPrints = async (
  coins: string[],
  sinceMs: number,
  floorUsd: number,
  onWave?: (prints: LivePrint[]) => void
): Promise<LivePrint[]> => {
  return withErrorHandling(async () => {
    const start_time = new Date(sinceMs).toISOString();
    const all: LivePrint[] = [];
    for (let i = 0; i < coins.length; i += WAVE_SIZE) {
      if (i > 0) await new Promise((r) => setTimeout(r, WAVE_GAP_MS));
      const settled = await Promise.allSettled(
        coins.slice(i, i + WAVE_SIZE).map((coin) =>
          get<Envelope<IndexerFill[]>>(`/indexer/fills/`, {
            coin,
            size_usd: floorUsd,
            start_time,
            limit: 1000,
            order: "desc",
          })
        )
      );
      const fills = settled.flatMap((r) => (r.status === "fulfilled" && r.value?.data ? r.value.data : []));
      const prints = foldFills(fills).filter((p) => p.time >= sinceMs);
      all.push(...prints);
      onWave?.(prints);
    }
    return all;
  }, "fetching recent prints");
};
