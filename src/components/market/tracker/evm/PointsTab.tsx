"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiRibbon, Skeleton, type KpiCell } from "@/components/common";
import { compactCount } from "@/lib/formatters/numberFormatting";
import { useWalletPoints } from "@/services/market/tracker/hyperfolio";
import { HyperfolioNotice } from "./HyperfolioNotice";

interface PointsTabProps {
  address: string;
}

/** Farming points per protocol (Hyperfolio `/points`) — one tile per protocol with a balance. */
export function PointsTab({ address }: PointsTabProps) {
  const { points, isLoading, error, refetch } = useWalletPoints(address);

  const cells = useMemo<KpiCell[]>(
    () =>
      points
        .filter((p) => p.points > 0)
        .sort((a, b) => b.points - a.points)
        .map((p) => ({
          key: p.protocol,
          label: p.protocol,
          value: compactCount(p.points),
          sub: "points",
          tone: "gold" as const,
        })),
    [points]
  );

  if (error && points.length === 0) {
    return (
      <div className="p-3.5">
        <HyperfolioNotice error={error} onRetry={refetch} />
      </div>
    );
  }

  if (isLoading && points.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-subtle">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface p-3.5">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (cells.length === 0) {
    return (
      <EmptyState
        withCard={false}
        title="No points yet"
        description={`No farming points on the ${points.length} tracked protocols.`}
        minHeight="min-h-[160px]"
      />
    );
  }

  return (
    <div>
      <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-4" bordered={false} />
      <p className="px-3.5 py-2 text-[11px] text-text-tertiary border-t border-border-subtle">
        Tracked: {points.map((p) => p.protocol).join(", ")}
      </p>
    </div>
  );
}
