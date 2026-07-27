"use client";

import { memo } from "react";
import { AlertTriangle } from "lucide-react";
import type { RevenueMeta } from "@/services/market/revenue";

/** Only the sources whose freeze is visible in a chart are worth naming. */
const WATCHED = [
  { key: "perpSpot", label: "Perp and spot" },
  { key: "priority", label: "Order priority" },
] as const;

// UTC: every series in the breakdown buckets by UTC day, so the label must too.
const formatDay = (date: string): string => {
  const ms = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(ms)) return date;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

/**
 * Names any revenue source that has stopped advancing, and the last day it
 * covers.
 *
 * A frozen upstream feed still answers, so bucketing it yields zeros, and a
 * zero in a stacked chart is a band that simply stops. That is visually
 * identical to a source that genuinely went quiet, and the reader has no way to
 * tell which one they are looking at. Production spent sixteen days drawing the
 * order-priority band down to nothing for exactly this reason.
 *
 * Rendered as a footer fragment so it sits in the same strip as the other
 * provenance notes rather than shouting over the data.
 */
export const SourceCoverageNote = memo(function SourceCoverageNote({
  meta,
}: {
  meta?: RevenueMeta | null;
}) {
  if (!meta) return null;

  // `error` and `stale` reach the reader the same way: the band drops to zero.
  // The first is a fetch that failed, the second a feed that stopped moving,
  // and neither is a quiet day.
  const frozen = WATCHED.filter((s) => {
    const status = meta.sourceStatus?.[s.key];
    return status === "stale" || status === "error";
  }).map((s) => ({ ...s, through: meta.coverage?.[s.key] ?? null }));

  if (frozen.length === 0) return null;

  return (
    <>
      {frozen.map((s) => (
        <span key={s.key} className="flex items-center gap-1 text-warning">
          <AlertTriangle size={10} className="shrink-0" />
          {s.label} {s.through ? `stops ${formatDay(s.through)}` : "is not reporting"}
        </span>
      ))}
    </>
  );
});
