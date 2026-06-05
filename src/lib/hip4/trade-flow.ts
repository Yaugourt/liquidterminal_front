/**
 * Derive per-trader and aggregate TRADE FLOW for a single outcome coin from its
 * fills feed. This is the honest substitute for the competitor's "Top Holders" /
 * "Positions" panels: HIP-4 exposes no holdings / open-interest endpoint (those
 * fields are 100% null), only the fills feed — so we surface *observed trade
 * flow* (capital that bought vs sold this outcome), never point-in-time
 * holdings, and label it as such in the UI.
 *
 * Excludes protocol operations (Split/Merge/Negate) and settlement fills
 * (px 0 or 1), which aren't real directional trades.
 */

import type { Hip4FillRow } from "@/services/indexer/hip4";

export interface Hip4TraderFlow {
  user: string;
  /** Notional bought (capital entering this outcome). */
  buy: number;
  /** Notional sold (capital exiting). */
  sell: number;
  /** buy − sell. */
  net: number;
  /** buy + sell. */
  volume: number;
  fills: number;
}

export interface Hip4TradeFlow {
  traders: Hip4TraderFlow[];
  buy: number;
  sell: number;
  volume: number;
  net: number;
  traderCount: number;
  /** Volume share held by the top 5 traders (0–1) — concentration signal. */
  top5Share: number;
}

const TRADE_DIRS = new Set(["Buy", "Sell", "buy", "sell", "B", "S"]);

function isTradeFill(f: Hip4FillRow): boolean {
  // Protocol ops carry a non-trade `dir` (e.g. "Split Outcome", "Merge Question").
  if (f.dir && !TRADE_DIRS.has(f.dir)) return false;
  // Settlement fills report px = 0 or 1 — not directional trades.
  if (!Number.isFinite(f.px) || f.px <= 0 || f.px >= 1) return false;
  return Number.isFinite(f.notional) && f.notional > 0;
}

function isBuy(f: Hip4FillRow): boolean {
  return f.dir === "Buy" || f.side === "B" || f.side === "buy";
}

export function buildTradeFlow(fills: Hip4FillRow[]): Hip4TradeFlow {
  const byUser = new Map<string, Hip4TraderFlow>();
  let buy = 0;
  let sell = 0;

  for (const f of fills) {
    if (!isTradeFill(f)) continue;
    const bought = isBuy(f);
    const notional = f.notional;
    if (bought) buy += notional;
    else sell += notional;

    let t = byUser.get(f.user);
    if (!t) {
      t = { user: f.user, buy: 0, sell: 0, net: 0, volume: 0, fills: 0 };
      byUser.set(f.user, t);
    }
    if (bought) t.buy += notional;
    else t.sell += notional;
    t.volume += notional;
    t.fills += 1;
  }

  const traders = Array.from(byUser.values());
  for (const t of traders) t.net = t.buy - t.sell;
  traders.sort((a, b) => b.volume - a.volume);

  const volume = buy + sell;
  const top5Volume = traders.slice(0, 5).reduce((acc, t) => acc + t.volume, 0);

  return {
    traders,
    buy,
    sell,
    volume,
    net: buy - sell,
    traderCount: traders.length,
    top5Share: volume > 0 ? top5Volume / volume : 0,
  };
}
