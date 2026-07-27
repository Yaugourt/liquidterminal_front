"use client";

import { memo } from "react";
import { DataStatus } from "@/components/common";
import { useTotalFills24h } from "@/services/indexer/overview";

/**
 * ExplorerFreshness — the single page-level "updated Xs ago" cue for /explorer.
 *
 * The dashboard aggregates many independent polled sources; rather than one
 * badge per card, we surface a single representative freshness signal in the
 * PageHeader. It rides the network-wide 24h fills feed (the same hook that
 * powers NetworkPulse's Core ribbon), the most page-representative polled
 * source on the screen.
 */
export const ExplorerFreshness = memo(function ExplorerFreshness() {
  const { dataUpdatedAt, isRefreshing, refetch } = useTotalFills24h();

  return (
    <DataStatus
      variant="polled"
      updatedAt={dataUpdatedAt}
      isRefreshing={isRefreshing}
      onRefresh={refetch}
    />
  );
});
