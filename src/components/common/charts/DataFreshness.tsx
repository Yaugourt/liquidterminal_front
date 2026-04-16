"use client";

import { useState, useEffect, memo } from "react";

interface DataFreshnessProps {
  lastUpdated: Date | null;
  className?: string;
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

const DataFreshnessComponent = ({ lastUpdated, className = "" }: DataFreshnessProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!lastUpdated) return;
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  if (!lastUpdated) return null;

  return (
    <span
      className={`text-[10px] text-text-muted/60 tabular-nums select-none ${className}`}
      title={lastUpdated.toLocaleString()}
    >
      Updated {formatRelativeTime(lastUpdated)}
    </span>
  );
};

export const DataFreshness = memo(DataFreshnessComponent);
