"use client";

import { useState } from "react";
import {
  PriorityFeesKpiRow,
  PriorityFeesOverviewChart,
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
  const leaderboard = usePriorityFeesLeaderboard({ hours, limit: 25 });
  const gossip = usePriorityFeesGossipStatus();

  const liveCount = gossip.data?.length ?? null;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-outfit text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Priority fees
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Priority gas paid on fills, HIP-3 gossip auction slots, and leaderboards.
        </p>
      </div>

      <PriorityFeesKpiRow
        stats={stats.data}
        isLoading={stats.isLoading}
        liveGossipSlots={liveCount}
        gossipLoading={gossip.isLoading}
      />

      <PriorityFeesOverviewChart
        hours={hours}
        onHoursChange={setHours}
        stats={stats.data}
        isLoading={stats.isLoading}
        error={stats.error}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch">
        <PriorityFeesLeaderboardCard
          entries={leaderboard.data}
          isLoading={leaderboard.isLoading}
          error={leaderboard.error}
          onRetry={() => leaderboard.refetch()}
        />
        <PriorityFeesGossipStatusCard
          slots={gossip.data}
          isLoading={gossip.isLoading}
          error={gossip.error}
          onRetry={() => gossip.refetch()}
        />
      </div>

      <PriorityFeesHistoryTable />
    </div>
  );
}
