/**
 * Helpers for Hyperliquid's public `trades` websocket channel.
 *
 * A frame carries a batch of trades, oldest first: the last ~30 trades right
 * after subscribing (replayed after every reconnect), then whatever filled
 * since the previous frame (measured 2026-09-28 on BTC and HYPE). Reading only
 * `data[0]` keeps the oldest trade of each frame and drops the others.
 */

interface WsTradeLike {
  time: number;
  tid: number;
}

/** The most recent trade of a frame (the last one listed on equal times). */
export function newestTrade<T extends WsTradeLike>(batch: readonly T[]): T | undefined {
  let newest: T | undefined;
  for (const trade of batch) {
    if (!newest || trade.time >= newest.time) newest = trade;
  }
  return newest;
}

/**
 * Put a frame on top of a newest-first list, capped at `max`. Trades already
 * listed are skipped (a reconnect replays the snapshot). Returns `current`
 * itself when the frame brings nothing new, so a store can skip the update.
 */
export function mergeTrades<T extends WsTradeLike>(current: T[], batch: readonly T[], max: number): T[] {
  const seen = new Set(current.map((trade) => trade.tid));
  const fresh: T[] = [];
  // Walk the frame backwards so equal times stay newest first after the
  // (stable) sort.
  for (let i = batch.length - 1; i >= 0; i--) {
    const trade = batch[i];
    if (seen.has(trade.tid)) continue;
    seen.add(trade.tid);
    fresh.push(trade);
  }
  if (fresh.length === 0) return current;
  fresh.sort((a, b) => b.time - a.time);
  return [...fresh, ...current].slice(0, max);
}
