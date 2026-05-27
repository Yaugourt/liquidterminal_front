"use client";

import { useEffect, useState } from "react";

interface Hip4StalenessChipProps {
  /** Epoch ms of the last successful fetch. */
  updatedAt: number | null;
  /** Show the chip only when data is older than this threshold (ms). Default 60s. */
  warnAfterMs?: number;
}

function formatAge(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

/** Inline pill rendered only when the underlying hook's data is older than
 * `warnAfterMs`. Re-renders once per second to keep the relative time honest. */
export function Hip4StalenessChip({ updatedAt, warnAfterMs = 60_000 }: Hip4StalenessChipProps) {
  const [, force] = useState(0);

  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (updatedAt == null) return null;
  const age = Date.now() - updatedAt;
  if (age < warnAfterMs) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded bg-surface-2 border border-border-subtle px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
      <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
      Updated {formatAge(age)}
    </span>
  );
}
