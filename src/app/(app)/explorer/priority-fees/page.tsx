"use client";

import { useState } from "react";
import { DataStatus, PageHeader, TimeframeTabs } from "@/components/common";
import {
  PriorityBurnChart,
  PriorityFeesRibbon,
  PriorityFillsCard,
  PriorityMechanismsCard,
  PriorityPayersCard,
  seriesWindowToHours,
} from "@/components/explorer/priority-fees";
import {
  useGossipFreshness,
  usePriorityFeesLeaderboard,
  usePriorityFeesSeries,
  type PriorityFeesSeriesWindow,
} from "@/services/explorer/priority-fees";
import type { Timeframe } from "@/lib/timeframe";

const WINDOW_OPTIONS: Timeframe[] = ["24h", "7d"];
/** Deep enough that the concentration bar's tail is real, not a truncation. */
const LEADERBOARD_LIMIT = 100;

export default function PriorityFeesPage() {
  const [window, setWindow] = useState<PriorityFeesSeriesWindow>("24h");

  const { series, isLoading, isRefreshing, error, refetch, dataUpdatedAt } =
    usePriorityFeesSeries(window);
  const leaderboard = usePriorityFeesLeaderboard({
    hours: seriesWindowToHours(window),
    limit: LEADERBOARD_LIMIT,
  });
  const gossip = useGossipFreshness();

  const hypeUsd = series?.meta.hypeUsd ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Priority fees"
        description="HYPE burned to jump the queue on HyperCore, by hour, by payer and by fill."
        actions={
          <DataStatus
            variant="polled"
            updatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
          />
        }
      >
        <div className="flex justify-end sm:justify-start">
          <TimeframeTabs
            options={WINDOW_OPTIONS}
            value={window}
            onChange={(value) => setWindow(value as PriorityFeesSeriesWindow)}
          />
        </div>
      </PageHeader>

      <PriorityFeesRibbon series={series} window={window} isLoading={isLoading} />

      <PriorityBurnChart series={series} window={window} isLoading={isLoading} error={error} />

      {/* Both tables carry six columns; below xl a half-width card would force
          them to scroll sideways, so they only pair up once there is room. */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:items-stretch">
        <PriorityPayersCard
          entries={leaderboard.data}
          windowGas={series?.totals.gas ?? null}
          hypeUsd={hypeUsd}
          isLoading={leaderboard.isLoading}
          error={leaderboard.error}
          onRetry={() => leaderboard.refetch()}
        />
        <PriorityFillsCard hypeUsd={hypeUsd} />
      </div>

      <PriorityMechanismsCard
        gossipLastSnapshotMs={gossip.lastSnapshotMs}
        isLoading={gossip.isLoading}
      />
    </div>
  );
}
