"use client";

import { memo, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * DataStatus — the single freshness cue for any data card (§ live/refresh pass).
 *
 * Two variants, both sit in a card-head action slot (the `ml-auto` corner) or
 * a PageHeader `actions` slot:
 *
 *  - `live`   → green pulsing dot + label ("Live") for WebSocket-pushed cards.
 *               Falls back to a muted "Offline" dot when `connected` is false.
 *  - `polled` → "updated Xs ago" (ticks itself) + an optional manual refresh
 *               button that spins while a fetch is in flight.
 *
 * Wire the `polled` variant straight to `useDataFetching`:
 *   const { dataUpdatedAt, isRefreshing, refetch } = useDataFetching(...);
 *   <DataStatus variant="polled" updatedAt={dataUpdatedAt}
 *               isRefreshing={isRefreshing} onRefresh={refetch} />
 */

type DataStatusVariant = "live" | "polled";

interface DataStatusProps {
  variant: DataStatusVariant;
  /** polled: epoch ms or Date of the last successful fetch (`dataUpdatedAt`). */
  updatedAt?: number | Date | null;
  /** polled: manual refresh handler (`refetch`). Omit to hide the button. */
  onRefresh?: () => void;
  /** polled: true while a background/manual fetch runs (`isRefreshing`) — spins the icon. */
  isRefreshing?: boolean;
  /** live: connection state. `false` renders a muted "Offline" dot. Defaults to true. */
  connected?: boolean;
  /** live: label next to the dot. Defaults to "Live". */
  label?: string;
  className?: string;
}

function toDate(v?: number | Date | null): Date | null {
  if (v == null) return null;
  return typeof v === "number" ? new Date(v) : v;
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

const DataStatusComponent = ({
  variant,
  updatedAt,
  onRefresh,
  isRefreshing = false,
  connected = true,
  label = "Live",
  className = "",
}: DataStatusProps) => {
  const [, setTick] = useState(0);
  const date = toDate(updatedAt);
  const dateKey = date ? date.getTime() : 0;

  // Re-render every 10s so "updated Xs ago" keeps counting up on its own.
  useEffect(() => {
    if (variant !== "polled" || dateKey === 0) return;
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, [variant, dateKey]);

  if (variant === "live") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold select-none ${
          connected ? "text-success" : "text-text-tertiary"
        } ${className}`}
      >
        <span className="relative inline-flex h-1.5 w-1.5">
          {connected && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          )}
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
              connected ? "bg-success" : "bg-text-tertiary"
            }`}
          />
        </span>
        {connected ? label : "Offline"}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {date && (
        <span
          className="text-[10px] text-text-tertiary/70 tabular-nums select-none"
          title={date.toLocaleString()}
        >
          updated {formatRelativeTime(date)}
        </span>
      )}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh data"
          className="w-5 h-5 rounded grid place-items-center text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors disabled:opacity-60"
        >
          <RefreshCw size={11} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      )}
    </span>
  );
};

export const DataStatus = memo(DataStatusComponent);
