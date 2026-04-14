"use client";

import { useState } from "react";
import {
  PriorityFeesKpiRow,
  PriorityFeesLeaderboardCard,
  PriorityFeesGossipStatusCard,
  PriorityFeesHistoryTable,
  PriorityFeesWindowSelector,
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

      <div className="flex justify-end sm:justify-start">
        <PriorityFeesWindowSelector hours={hours} onHoursChange={setHours} />
      </div>

      {stats.error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          {stats.error.message}
        </div>
      )}

      <PriorityFeesKpiRow stats={stats.data} isLoading={stats.isLoading} />

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
