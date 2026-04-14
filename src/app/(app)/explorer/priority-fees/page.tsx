"use client";

import { useState } from "react";
import {
  PriorityFeesKpiRow,
  PriorityFeesRunRateCard,
  PriorityFeesOverviewChart,
  PriorityFeesFillsTimeseriesChart,
  PriorityFeesLeaderboardCard,
  PriorityFeesGossipStatusCard,
  PriorityFeesHistoryTable,
} from "@/components/explorer/priority-fees";
import {
  usePriorityFeesStats,
  usePriorityFeesLeaderboard,
  usePriorityFeesGossipStatus,
} from "@/services/explorer/priority-fees";

export default function PriorityFeesPage() {
  const [hours, setHours] = useState(24);

  const stats = usePriorityFeesStats({ hours });
  const leaderboard = usePriorityFeesLeaderboard({ hours, limit: 11 });
  const gossip = usePriorityFeesGossipStatus();

  const liveCount = gossip.data?.length ?? null;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-outfit text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Priority fees
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Priority gas on fills (HypeDexer <code className="text-xs">priorityGas</code>), gossip
          auctions, window aggregates, and leaderboards.
        </p>
      </div>

      <PriorityFeesKpiRow
        stats={stats.data}
        isLoading={stats.isLoading}
        liveGossipSlots={liveCount}
        gossipLoading={gossip.isLoading}
      />

      <PriorityFeesRunRateCard
        stats={stats.data}
        isLoading={stats.isLoading}
        gossipSlots={gossip.data}
        selectedWindowHours={hours}
      />

      <PriorityFeesOverviewChart
        hours={hours}
        onHoursChange={setHours}
        stats={stats.data}
        isLoading={stats.isLoading}
        error={stats.error}
      />

      <PriorityFeesFillsTimeseriesChart hours={hours} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch">
        <PriorityFeesLeaderboardCard
          entries={leaderboard.data}
          isLoading={leaderboard.isLoading}
          error={leaderboard.error}
          onRetry={() => leaderboard.refetch()}
        />
        <PriorityFeesGossipStatusCard
          slots={gossip.data}
          previousWinners={gossip.previousWinners}
          isLoading={gossip.isLoading}
          error={gossip.error}
          onRetry={() => gossip.refetch()}
        />
      </div>

      <PriorityFeesHistoryTable />
    </div>
  );
}
