import { useRef } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4Fills } from "../api";
import type { Hip4FillRow, UseHip4FillsResult } from "../types";

// A coin's tape is read in two cadences. The head (the newest 50 fills, 7
// credits) every 5 s keeps the newest fill at most ~10 s old (the backend
// keeps an active coin's head 5 s); the base (400 fills, 42 credits) every
// minute feeds the trade-flow and top-traders panels. That is ~126 credits a
// minute for a coin that trades, against 252 for the 400-fill read every 10 s.
const HEAD_LIMIT = 50;
const BASE_LIMIT = 400;
const HEAD_POLL_MS = 5_000;
const BASE_REFRESH_MS = 60_000;
// Fills kept between two base reads: a busy coin cannot grow the tape without
// bound (the base read resets it to its own window).
const MAX_TAPE = 1_000;

/** What one coin's tape holds: every fill read so far, once. */
interface CoinTape {
  coin: string;
  fills: Map<string, Hip4FillRow>;
  /** When the last base read answered; 0 before the first. */
  baseAt: number;
  /** `fills` newest first, as last returned (kept while a head read adds nothing). */
  list: Hip4FillRow[];
}

/**
 * A fill's identity across reads. The indexer lists a trade once per account
 * (both sides share the trade id), so the account, side and kind belong to it.
 * Without a trade id (protocol operations): the transaction, account, time,
 * price and size.
 */
function fillKey(f: Hip4FillRow): string {
  if (f.tid != null) return `t:${f.tid}|${f.user}|${f.side}|${f.dir ?? ""}`;
  return `h:${f.hash}|${f.user}|${f.time}|${f.px}|${f.sz}|${f.side}|${f.dir ?? ""}`;
}

function timeOf(f: Hip4FillRow): number {
  const t = Date.parse(f.time);
  return Number.isFinite(t) ? t : 0;
}

function newestFirst(a: Hip4FillRow, b: Hip4FillRow): number {
  return timeOf(b) - timeOf(a) || (b.tid ?? 0) - (a.tid ?? 0);
}

function listOf(fills: Map<string, Hip4FillRow>): Hip4FillRow[] {
  const list = [...fills.values()].sort(newestFirst);
  if (list.length > MAX_TAPE) {
    for (const f of list.slice(MAX_TAPE)) fills.delete(fillKey(f));
    return list.slice(0, MAX_TAPE);
  }
  return list;
}

/**
 * Folds a read into the tape. A base read replaces everything it covers and
 * keeps only the fills newer than its newest row (the heads read since); a
 * head read adds the fills the tape does not hold yet. Returns the tape's list
 * (the same array when nothing was added).
 */
function applyRead(tape: CoinTape, rows: Hip4FillRow[], isBase: boolean): Hip4FillRow[] {
  if (isBase) {
    const newest = rows.reduce((max, f) => Math.max(max, timeOf(f)), 0);
    const next = new Map<string, Hip4FillRow>();
    for (const f of rows) next.set(fillKey(f), f);
    if (rows.length > 0) {
      for (const [key, f] of tape.fills) if (timeOf(f) > newest) next.set(key, f);
    } else {
      // Nothing came back: an empty answer must not blank a tape on screen.
      for (const [key, f] of tape.fills) next.set(key, f);
    }
    tape.fills = next;
    tape.baseAt = Date.now();
    tape.list = listOf(next);
    return tape.list;
  }
  let added = 0;
  for (const f of rows) {
    const key = fillKey(f);
    if (tape.fills.has(key)) continue;
    tape.fills.set(key, f);
    added += 1;
  }
  if (added > 0) tape.list = listOf(tape.fills);
  return tape.list;
}

/**
 * A coin's trade tape, newest first, every fill once. The first read and one
 * a minute are the 400-fill base; the polls in between read only the newest
 * 50 and merge them in by `fillKey`, so the recent-fills table, the trade
 * flow and the top traders (which all sum this list) count a fill exactly once
 * however many reads returned it. A coin trading more than 50 fills between
 * two heads leaves a gap that the next base read closes.
 */
export function useHip4CoinFills(coin: string): UseHip4FillsResult {
  const tapeRef = useRef<CoinTape | null>(null);

  const { data, isLoading, error, isStale, dataUpdatedAt, refetch } = useDataFetching<Hip4FillRow[]>({
    fetchFn: async () => {
      if (tapeRef.current?.coin !== coin) {
        tapeRef.current = { coin, fills: new Map(), baseAt: 0, list: [] };
      }
      // A coin change mid-read lands on this tape, not the next coin's.
      const tape = tapeRef.current;
      const isBase = tape.baseAt === 0 || Date.now() - tape.baseAt >= BASE_REFRESH_MS;
      const rows = await fetchHip4Fills({ coin, limit: isBase ? BASE_LIMIT : HEAD_LIMIT });
      return applyRead(tape, Array.isArray(rows) ? rows : [], isBase);
    },
    refreshInterval: HEAD_POLL_MS,
    dependencies: [coin],
    maxRetries: 3,
  });

  return {
    fills: Array.isArray(data) ? data : [],
    isLoading,
    error,
    isStale,
    dataUpdatedAt,
    refetch,
  };
}
