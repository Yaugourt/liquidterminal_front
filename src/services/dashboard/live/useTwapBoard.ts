"use client";

import { useEffect, useMemo, useState } from "react";
import { useTwapOrders } from "@/services/market/order/hooks/useTwapOrders";
import type { EnrichedTwapOrder, TwapMarketType } from "@/services/market/order/types";

/**
 * Live TWAP picture for the dashboard, from the indexed TWAP list (every
 * TWAP started in the last 24 hours, plus those still running from before).
 *
 * A TWAP slices its size into one order every 30 seconds over its duration,
 * so what is left to execute is estimated from the time elapsed: running
 * TWAPs carry no executed amount yet. Values use the current market price.
 */

export interface LiveTwap {
  hash: string;
  user: string;
  coin: string;
  market: TwapMarketType;
  isBuy: boolean;
  /** Full size in coin units and in USD at the current price. */
  size: number;
  totalUsd: number;
  /** Estimated from elapsed time. */
  doneFraction: number;
  remainingUsd: number;
  startTime: number;
  endTime: number;
}

export interface CoinTwapFlow {
  coin: string;
  buyLeftUsd: number;
  sellLeftUsd: number;
  netUsd: number;
  count: number;
}

export interface TwapSide {
  count: number;
  buyLeftUsd: number;
  sellLeftUsd: number;
  netUsd: number;
}

export interface TwapBoard {
  /** TWAPs still running now. */
  active: LiveTwap[];
  totals: TwapSide;
  /** Started in the last 24h (any status) and their full notional. */
  started24h: { count: number; usd: number; buys: number; sells: number };
  /** Real executed notional of the TWAPs that ended in the window (indexer source only). */
  executed24hUsd: number;
  byCoin: CoinTwapFlow[];
  hype: {
    active: LiveTwap[];
    totals: TwapSide;
    spot: TwapSide;
    perp: TwapSide;
    started24h: { count: number; usd: number };
  };
  updatedAt: number | null;
}

const isHype = (t: { coin: string }) => t.coin === "HYPE";

function side(list: LiveTwap[]): TwapSide {
  let buy = 0;
  let sell = 0;
  for (const t of list) {
    if (t.isBuy) buy += t.remainingUsd;
    else sell += t.remainingUsd;
  }
  return { count: list.length, buyLeftUsd: buy, sellLeftUsd: sell, netUsd: buy - sell };
}

function toLive(o: EnrichedTwapOrder, now: number): LiveTwap {
  const duration = o.action.twap.m * 60_000;
  const doneFraction = duration > 0 ? Math.min(1, Math.max(0, (now - o.time) / duration)) : 1;
  return {
    hash: o.hash,
    user: o.user,
    coin: o.tokenSymbol,
    market: o.marketType,
    isBuy: o.action.twap.b,
    size: parseFloat(o.action.twap.s),
    totalUsd: o.totalValueUSD,
    doneFraction,
    remainingUsd: o.totalValueUSD * (1 - doneFraction),
    startTime: o.time,
    endTime: o.time + duration,
  };
}

export function useTwapBoard(): TwapBoard & { isLoading: boolean; error: Error | null } {
  const { orders, metadata, isLoading, error } = useTwapOrders({ limit: 10_000, status: "all" });

  // Remaining amounts move with the clock, not only with the 30s refetch.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  const board = useMemo<TwapBoard>(() => {
    const dayAgo = now - 86_400_000;
    const all = orders.filter((o) => !o.error && o.totalValueUSD > 0).map((o) => toLive(o, now));
    const running = new Set(
      orders.filter((o) => !o.ended && !o.error && now < o.time + o.action.twap.m * 60_000).map((o) => o.hash)
    );
    const active = all.filter((t) => running.has(t.hash)).sort((a, b) => b.remainingUsd - a.remainingUsd);
    const recent = all.filter((t) => t.startTime >= dayAgo);

    const coins = new Map<string, CoinTwapFlow>();
    for (const t of active) {
      const c = coins.get(t.coin) ?? { coin: t.coin, buyLeftUsd: 0, sellLeftUsd: 0, netUsd: 0, count: 0 };
      if (t.isBuy) c.buyLeftUsd += t.remainingUsd;
      else c.sellLeftUsd += t.remainingUsd;
      c.netUsd = c.buyLeftUsd - c.sellLeftUsd;
      c.count += 1;
      coins.set(t.coin, c);
    }

    const executed24hUsd = orders
      .filter((o) => o.time >= dayAgo && o.ended)
      .reduce((s, o) => s + (o.executedNtl ?? 0), 0);
    const hypeActive = active.filter(isHype);
    const hypeRecent = recent.filter(isHype);
    return {
      active,
      totals: side(active),
      started24h: {
        count: recent.length,
        usd: recent.reduce((s, t) => s + t.totalUsd, 0),
        buys: recent.filter((t) => t.isBuy).reduce((s, t) => s + t.totalUsd, 0),
        sells: recent.filter((t) => !t.isBuy).reduce((s, t) => s + t.totalUsd, 0),
      },
      executed24hUsd,
      byCoin: [...coins.values()].sort(
        (a, b) => b.buyLeftUsd + b.sellLeftUsd - (a.buyLeftUsd + a.sellLeftUsd)
      ),
      hype: {
        active: hypeActive,
        totals: side(hypeActive),
        spot: side(hypeActive.filter((t) => t.market === "spot")),
        perp: side(hypeActive.filter((t) => t.market === "perp")),
        started24h: { count: hypeRecent.length, usd: hypeRecent.reduce((s, t) => s + t.totalUsd, 0) },
      },
      updatedAt: metadata?.lastUpdate ?? null,
    };
  }, [orders, metadata, now]);

  return { ...board, isLoading, error };
}
