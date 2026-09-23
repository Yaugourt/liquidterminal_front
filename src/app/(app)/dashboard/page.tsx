"use client";

import { useMemo } from "react";
import { SectionHead } from "@/components/common";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useLiveMarketFeed } from "@/services/dashboard/live/useLiveMarketFeed";
import { useChainPulse } from "@/services/dashboard/live/useChainPulse";
import { LiveStrip } from "@/components/dashboard/live/LiveStrip";
import { BigPrintsCard } from "@/components/dashboard/live/BigPrintsCard";
import { LiveLiquidationsCard } from "@/components/dashboard/live/LiveLiquidationsCard";
import { PriceBoard } from "@/components/dashboard/live/PriceBoard";
import { ChainHeartbeat } from "@/components/dashboard/live/ChainHeartbeat";
import { SignalRow } from "@/components/dashboard/live/SignalRow";

/** Perps on the price board, by 24h volume. */
const BOARD_SIZE = 16;
/** Perps whose trades feed the big-prints tape (the top of the board). */
const TAPE_SIZE = 12;

/**
 * Dashboard · Overview: what is happening on Hyperliquid right now.
 *
 * Streams: the public Hyperliquid websockets (trades, allMids, explorer
 * blocks and transactions) and the backend liquidation push. Each stream is
 * buffered and flushed at most once per second. The 24h signals under them
 * sit on light polled endpoints. Depth stays in the Market, Capital and
 * Ecosystem tabs. Every socket opened here closes when the tab unmounts.
 */
export default function DashboardOverview() {
  const { data: topPerps } = useTrendingPerpMarkets(BOARD_SIZE, "volume", "desc");
  const boardCoins = useMemo(() => topPerps.map((m) => m.name), [topPerps]);
  const tapeCoins = useMemo(() => boardCoins.slice(0, TAPE_SIZE), [boardCoins]);

  const feed = useLiveMarketFeed(tapeCoins, boardCoins);
  const pulse = useChainPulse();

  return (
    <div className="space-y-6">
      <section className="space-y-2.5">
        <SectionHead title="Live" subtitle="Streaming from Hyperliquid, refreshed every second" />
        <LiveStrip pulse={pulse} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 min-w-0">
          <BigPrintsCard prints={feed.prints} connected={feed.connected} coinCount={tapeCoins.length} />
        </div>
        <LiveLiquidationsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 min-w-0">
          <PriceBoard markets={topPerps} mids={feed.mids} connected={feed.connected} />
        </div>
        <ChainHeartbeat pulse={pulse} />
      </div>

      <section className="space-y-2.5">
        <SectionHead title="Signals" subtitle="The last 24 hours, one tile each" />
        <SignalRow />
      </section>
    </div>
  );
}
