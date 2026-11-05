"use client";

import { useEffect, useMemo, useState } from "react";
import { useTwapOrders } from "@/services/market/order/hooks/useTwapOrders";
import { doneFraction, isTwapStalled, twapProgressInput, type TwapProgressInput } from "@/services/market/order/twap-progress";
import type { EnrichedTwapOrder, TwapMarketType } from "@/services/market/order/types";

/**
 * Live TWAP picture for the dashboard, from the indexed TWAP list (every
 * TWAP started in the last 24 hours, plus those still running from before)
 * with the backend's live feed merged in: new and ended TWAPs show up within
 * seconds, and the clock ticks every second.
 *
 * What is left to execute uses the real executed size when the feed has
 * followed the TWAP since its start, run on by the clock between two fills;
 * otherwise it is estimated from the time elapsed (the schedule spreads the
 * size evenly over the duration, one slice every 30 s from the start),
 * floored by the executed size when one is known. Both move with the clock,
 * not only with the polls and the pushes (see twap-progress.ts). A TWAP
 * followed since its start that stops filling and falls behind its schedule
 * is "stalled": it stays out of what is running and what is left, and is
 * counted apart. Values use the current market price.
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
  /** Executed share when known, otherwise estimated from elapsed time. */
  doneFraction: number;
  remainingUsd: number;
  /** What `doneFraction` was computed from: a row runs the drain on with it between two boards (see TwapRow). */
  progress: TwapProgressInput;
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
  /** Executed notional of the TWAPs started in the window: final for ended ones, so far for running ones (indexer source only). */
  executed24hUsd: number;
  /** Running on paper but without a fill for 10 minutes (kept out of everything above). */
  stalled: number;
  byCoin: CoinTwapFlow[];
  hype: {
    active: LiveTwap[];
    totals: TwapSide;
    spot: TwapSide;
    perp: TwapSide;
    started24h: { count: number; usd: number };
    stalled: number;
  };
  updatedAt: number | null;
  /** The live feed is connected and its upstream is up. */
  isLive: boolean;
  /** The instant every amount above was computed at (ticks every second): countdowns read the same clock. */
  now: number;
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
  const progress = twapProgressInput(o);
  const done = doneFraction(progress, now);
  return {
    hash: o.hash,
    user: o.user,
    coin: o.tokenSymbol,
    market: o.marketType,
    isBuy: o.action.twap.b,
    size: parseFloat(o.action.twap.s),
    totalUsd: o.totalValueUSD,
    doneFraction: done,
    remainingUsd: o.totalValueUSD * (1 - done),
    progress,
    startTime: o.time,
    endTime: o.time + duration,
  };
}

export function useTwapBoard(): TwapBoard & { isLoading: boolean; error: Error | null } {
  const { orders, metadata, isLoading, error, isLive } = useTwapOrders({ limit: 10_000, status: "all" });

  // Remaining amounts move with the clock, not only with the 15s refetch and the live pushes.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);

  const board = useMemo<TwapBoard>(() => {
    const dayAgo = now - 86_400_000;
    const all = orders.filter((o) => !o.error && o.totalValueUSD > 0).map((o) => toLive(o, now));
    const running = new Set<string>();
    const stalledHashes = new Set<string>();
    for (const o of orders) {
      if (o.ended || o.error || now >= o.time + o.action.twap.m * 60_000) continue;
      (isTwapStalled(o, now) ? stalledHashes : running).add(o.hash);
    }
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

    // Ended: the final value; running: what the live feed has seen executed so far (0 without it).
    const executed24hUsd = orders
      .filter((o) => o.time >= dayAgo)
      .reduce((s, o) => s + (o.executedNtl ?? 0), 0);
    const stalled = all.filter((t) => stalledHashes.has(t.hash));
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
      stalled: stalled.length,
      byCoin: [...coins.values()].sort(
        (a, b) => b.buyLeftUsd + b.sellLeftUsd - (a.buyLeftUsd + a.sellLeftUsd)
      ),
      hype: {
        active: hypeActive,
        totals: side(hypeActive),
        spot: side(hypeActive.filter((t) => t.market === "spot")),
        perp: side(hypeActive.filter((t) => t.market === "perp")),
        started24h: { count: hypeRecent.length, usd: hypeRecent.reduce((s, t) => s + t.totalUsd, 0) },
        stalled: stalled.filter(isHype).length,
      },
      updatedAt: metadata?.lastUpdate ?? null,
      isLive: isLive ?? false,
      now,
    };
  }, [orders, metadata, now, isLive]);

  return { ...board, isLoading, error };
}
