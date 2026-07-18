"use client";

import { chartPalette } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";

interface VenueSplitBarProps {
  hip3Volume: number | null;
  perpVolume: number | null;
  spotVolume: number | null;
}

/**
 * Per-venue 24h volume split (the story of the moment told in one line:
 * HIP-3 builder DEXs vs core perps vs spot). Renders only when every part
 * is known — a partial split would be a lie.
 */
export function VenueSplitBar({ hip3Volume, perpVolume, spotVolume }: VenueSplitBarProps) {
  if (hip3Volume == null || perpVolume == null || spotVolume == null) return null;
  const total = hip3Volume + perpVolume + spotVolume;
  if (total <= 0) return null;

  const segments = [
    { label: "HIP-3 builder perps", value: hip3Volume, color: chartPalette.violet },
    { label: "Core perps", value: perpVolume, color: chartPalette.accent },
    { label: "Spot", value: spotVolume, color: chartPalette.gold },
  ].map((s) => ({ ...s, pct: (s.value / total) * 100 }));

  return (
    <div className="border border-border-subtle rounded-lg px-3.5 py-2.5">
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px]">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-text-secondary">{s.label}</span>
            <span className="mono text-text-primary">{compactUsd(s.value)}</span>
            <span className="mono text-text-tertiary">· {s.pct.toFixed(0)}%</span>
          </span>
        ))}
        <span className="ml-auto text-[10px] text-text-tertiary hidden md:inline">
          per-venue volume · 24h
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden mt-2 bg-surface-2">
        {segments.map((s) => (
          <span key={s.label} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
        ))}
      </div>
    </div>
  );
}
