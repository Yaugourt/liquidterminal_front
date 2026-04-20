"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface VariationBadgeProps {
  pct?: number | null;
}

export function VariationBadge({ pct }: VariationBadgeProps) {
  if (pct === undefined || pct === null || !Number.isFinite(pct)) return null;
  const positive = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
        positive
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-rose-500/10 text-rose-400"
      }`}
    >
      {positive ? (
        <TrendingUp className="w-2.5 h-2.5" />
      ) : (
        <TrendingDown className="w-2.5 h-2.5" />
      )}
      {positive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}
